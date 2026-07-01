import type { PostSource, PostType } from "@/lib/db";

export interface NormalizedItem {
  source: PostSource;
  type: PostType;
  title: string;
  url: string;
  image: string | null;
  author: string | null;
  meta: Record<string, unknown>;
  publishedAt: string | null;
  description: string | null;
}
