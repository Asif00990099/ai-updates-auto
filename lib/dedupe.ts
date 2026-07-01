import { createHash } from "crypto";
import { getSupabase } from "@/lib/db";
import type { NormalizedItem } from "@/lib/sources/types";

export function contentHash(item: NormalizedItem): string {
  return createHash("sha256").update(`${item.source}:${item.url}`).digest("hex");
}

// Each hash is 64 chars; too many in one `.in()` filter overflows the
// request URI (Supabase/Cloudflare returns 414), so we look them up in chunks.
const HASH_CHUNK = 50;

async function existingHashes(hashes: string[]): Promise<Set<string>> {
  const supabase = getSupabase();
  const found = new Set<string>();

  for (let i = 0; i < hashes.length; i += HASH_CHUNK) {
    const chunk = hashes.slice(i, i + HASH_CHUNK);
    const { data, error } = await supabase
      .from("posts")
      .select("content_hash")
      .in("content_hash", chunk);
    if (error) throw error;
    for (const row of data ?? []) found.add(row.content_hash as string);
  }

  return found;
}

// Splits items into ones whose content_hash is not yet in the DB.
// Also de-duplicates within the batch itself (two sources can yield the
// same hash in one run, which would otherwise violate the unique index).
export async function filterNewItems(
  items: NormalizedItem[]
): Promise<Array<{ item: NormalizedItem; hash: string }>> {
  if (items.length === 0) return [];

  const withHashes = items.map((item) => ({ item, hash: contentHash(item) }));
  const existing = await existingHashes(withHashes.map((e) => e.hash));

  const seen = new Set<string>();
  return withHashes.filter((entry) => {
    if (existing.has(entry.hash) || seen.has(entry.hash)) return false;
    seen.add(entry.hash);
    return true;
  });
}
