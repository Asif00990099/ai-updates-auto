import { XMLParser } from "fast-xml-parser";
import type { NormalizedItem } from "./types";

const ARXIV_URL =
  "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=50";

interface ArxivAuthor {
  name?: string;
}

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  published?: string;
  author?: ArxivAuthor | ArxivAuthor[];
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export async function fetchArxiv(): Promise<NormalizedItem[]> {
  const res = await fetch(ARXIV_URL, { headers: { Accept: "application/atom+xml" } });
  if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);

  const entries: ArxivEntry[] = toArray(parsed?.feed?.entry);

  return entries.map((entry) => {
    const authors = toArray(entry.author)
      .map((a) => a?.name)
      .filter(Boolean) as string[];

    return {
      source: "arxiv",
      type: "paper",
      title: entry.title.replace(/\s+/g, " ").trim(),
      url: entry.id,
      image: null,
      author: authors[0] ?? null,
      meta: { authors },
      publishedAt: entry.published ?? null,
      description: entry.summary.replace(/\s+/g, " ").trim(),
    };
  });
}
