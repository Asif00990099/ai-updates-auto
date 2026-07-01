import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type PostType = "model" | "paper" | "news" | "repo" | "tool";
export type PostSource =
  | "huggingface"
  | "arxiv"
  | "rss"
  | "hn"
  | "github"
  | "producthunt";

export interface Post {
  id: number;
  source: PostSource;
  type: PostType;
  title: string;
  slug: string;
  summary: string | null;
  original_url: string;
  image_url: string | null;
  author: string | null;
  meta: Record<string, unknown> | null;
  content_hash: string;
  published_at: string | null;
  created_at: string;
}

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
  }

  client = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
