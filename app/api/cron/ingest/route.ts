import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { filterNewItems } from "@/lib/dedupe";
import { rewrite } from "@/lib/rewrite";
import { toSeoSlug } from "@/lib/slug";
import { fetchHuggingFace } from "@/lib/sources/huggingface";
import { fetchArxiv } from "@/lib/sources/arxiv";
import { fetchRss } from "@/lib/sources/rss";
import { fetchHackerNews } from "@/lib/sources/hackernews";
import { fetchGitHub } from "@/lib/sources/github";
import { fetchProductHunt } from "@/lib/sources/producthunt";
import type { NormalizedItem } from "@/lib/sources/types";
import type { Database } from "@/lib/database.types";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

export const runtime = "nodejs";
export const maxDuration = 60;

// Groq's free tier (~30 req/min) and Vercel Hobby's 60s function limit both
// cap how many items one run can properly rewrite. So we ingest a bounded
// number of the newest new items per run and rewrite all of them; the rest
// are picked up on the next hourly run. Fewer, well-rewritten posts also
// rank better than bulk auto-content.
const REWRITE_CONCURRENCY = Number(process.env.REWRITE_CONCURRENCY ?? 4);

// Per-type quota per run. Without this, news (which always has the freshest
// timestamps) crowds out models/papers/repos and the moat pages stay empty.
// Totals are kept small so every selected item fits Groq's tokens/min budget
// and actually gets rewritten (not rate-limited into raw fallback).
const TYPE_QUOTA: Record<string, number> = {
  model: 4,
  paper: 3,
  news: 4,
  repo: 2,
  tool: 2,
};

function publishedTime(item: NormalizedItem): number {
  return item.publishedAt ? new Date(item.publishedAt).getTime() : 0;
}

type Entry = { item: NormalizedItem; hash: string };

// Take the newest items from each type up to its quota, so every section of
// the site gets fresh content each run rather than whichever type is newest.
function selectBalanced(entries: Entry[]): Entry[] {
  const byType = new Map<string, Entry[]>();
  for (const e of entries) {
    const list = byType.get(e.item.type) ?? [];
    list.push(e);
    byType.set(e.item.type, list);
  }

  const selected: Entry[] = [];
  for (const [type, list] of byType) {
    const quota = TYPE_QUOTA[type] ?? 5;
    list.sort((a, b) => publishedTime(b.item) - publishedTime(a.item));
    selected.push(...list.slice(0, quota));
  }
  return selected;
}

const FETCHERS: Array<() => Promise<NormalizedItem[]>> = [
  fetchHuggingFace,
  fetchArxiv,
  fetchRss,
  fetchHackerNews,
  fetchGitHub,
  fetchProductHunt,
];

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.allSettled(FETCHERS.map((fetcher) => fetcher()));
  const items = results
    .filter((r): r is PromiseFulfilledResult<NormalizedItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const fetched = items.length;

  const allNew = await filterNewItems(items);

  // Balanced per-type selection, capped to the run's rate/time budget.
  const newEntries = selectBalanced(allNew);

  // Rewrite in small concurrent batches to stay under Groq's rate limit.
  const rows: PostInsert[] = [];

  for (let i = 0; i < newEntries.length; i += REWRITE_CONCURRENCY) {
    const batch = newEntries.slice(i, i + REWRITE_CONCURRENCY);
    const built = await Promise.all(
      batch.map(async ({ item, hash }) => {
        const { title, summary } = await rewrite(item.title, item.description);
        return {
          source: item.source,
          type: item.type,
          title,
          slug: toSeoSlug(title, hash),
          summary,
          original_url: item.url,
          image_url: item.image,
          author: item.author,
          meta: item.meta,
          content_hash: hash,
          published_at: item.publishedAt,
        };
      })
    );
    rows.push(...built);
  }

  let inserted = 0;
  if (rows.length > 0) {
    const supabase = getSupabase();
    const { error, count } = await supabase
      .from("posts")
      .insert(rows, { count: "exact" });
    if (error) {
      return NextResponse.json(
        { fetched, inserted: 0, skipped: fetched, error: error.message },
        { status: 500 }
      );
    }
    inserted = count ?? rows.length;
  }

  // Items that are new but exceeded this run's cap will be picked up next run.
  const deferred = Math.max(0, allNew.length - inserted);

  return NextResponse.json({
    fetched,
    new: allNew.length,
    inserted,
    deferred,
    skipped: fetched - allNew.length,
  });
}
