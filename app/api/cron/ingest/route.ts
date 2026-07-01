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

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const newEntries = await filterNewItems(items);

  const rows = await Promise.all(
    newEntries.map(async ({ item, hash }) => {
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

  return NextResponse.json({ fetched, inserted, skipped: fetched - inserted });
}
