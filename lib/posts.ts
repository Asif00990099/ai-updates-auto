import { getSupabase, type Post, type PostType } from "@/lib/db";

export async function getLatestPosts(limit = 30): Promise<Post[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPostsByType(type: PostType, limit = 30): Promise<Post[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("type", type)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Post | null;
}

// "New AI Models Today": last 24h, ranked by downloads velocity.
export async function getTodaysModels(limit = 50): Promise<Post[]> {
  const supabase = getSupabase();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("type", "model")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const rows = (data ?? []) as Post[];

  // Filter obvious spam: Hugging Face gets flooded with empty placeholder
  // repos. Keep only models that show a real signal (a task tag, or any
  // downloads/likes). Legit brand-new models still have a pipeline_tag.
  const filtered = rows.filter((row) => {
    const meta = (row.meta ?? {}) as {
      downloads?: number;
      likes?: number;
      pipeline_tag?: string | null;
    };
    return (
      !!meta.pipeline_tag ||
      Number(meta.downloads ?? 0) > 0 ||
      Number(meta.likes ?? 0) > 0
    );
  });

  return filtered.sort((a, b) => {
    const da = Number((a.meta as { downloads?: number } | null)?.downloads ?? 0);
    const db = Number((b.meta as { downloads?: number } | null)?.downloads ?? 0);
    return db - da;
  });
}

export async function getAllSlugs(): Promise<Array<Pick<Post, "slug" | "type" | "created_at">>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("slug, type, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<Pick<Post, "slug" | "type" | "created_at">>;
}
