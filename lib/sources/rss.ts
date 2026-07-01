import Parser from "rss-parser";
import { FEEDS } from "@/lib/feeds.config";
import type { NormalizedItem } from "./types";

const parser = new Parser();

// Cap items per feed. Some feeds expose huge archives; without this a
// single run can pull thousands of stale articles and bury fresh content.
const MAX_ITEMS_PER_FEED = 15;

async function fetchFeed(name: string, url: string): Promise<NormalizedItem[]> {
  const feed = await parser.parseURL(url);

  return (feed.items ?? []).slice(0, MAX_ITEMS_PER_FEED).map((item) => ({
    source: "rss",
    type: "news",
    title: item.title?.trim() ?? "Untitled",
    url: item.link ?? url,
    image: item.enclosure?.url ?? null,
    author: item.creator ?? item.author ?? name,
    meta: { feed: name },
    publishedAt: item.isoDate ?? item.pubDate ?? null,
    description: (item.contentSnippet ?? item.content ?? "").trim(),
  }));
}

// Every feed is isolated; a dead or slow feed is skipped, not fatal.
export async function fetchRss(): Promise<NormalizedItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map((feed) => fetchFeed(feed.name, feed.url))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<NormalizedItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
}
