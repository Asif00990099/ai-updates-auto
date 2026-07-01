import { createHash } from "crypto";
import { getSupabase } from "@/lib/db";
import type { NormalizedItem } from "@/lib/sources/types";

export function contentHash(item: NormalizedItem): string {
  return createHash("sha256").update(`${item.source}:${item.url}`).digest("hex");
}

// Splits items into ones whose content_hash is not yet in the DB.
export async function filterNewItems(
  items: NormalizedItem[]
): Promise<Array<{ item: NormalizedItem; hash: string }>> {
  if (items.length === 0) return [];

  const withHashes = items.map((item) => ({ item, hash: contentHash(item) }));
  const hashes = withHashes.map((entry) => entry.hash);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("content_hash")
    .in("content_hash", hashes);

  if (error) throw error;

  const existing = new Set((data ?? []).map((row) => row.content_hash as string));
  return withHashes.filter((entry) => !existing.has(entry.hash));
}
