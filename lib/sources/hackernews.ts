import type { NormalizedItem } from "./types";

const HN_URL = "https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story";

interface HNHit {
  objectID: string;
  title: string | null;
  url: string | null;
  author: string | null;
  created_at: string | null;
  points: number | null;
  num_comments: number | null;
  story_text: string | null;
}

export async function fetchHackerNews(): Promise<NormalizedItem[]> {
  const res = await fetch(HN_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Hacker News API error: ${res.status}`);

  const data: { hits: HNHit[] } = await res.json();

  return (data.hits ?? [])
    .filter((hit) => hit.title)
    .map((hit) => ({
      source: "hn",
      type: "news",
      title: hit.title as string,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
      image: null,
      author: hit.author,
      meta: { points: hit.points ?? 0, comments: hit.num_comments ?? 0 },
      publishedAt: hit.created_at,
      description: hit.story_text ?? null,
    }));
}
