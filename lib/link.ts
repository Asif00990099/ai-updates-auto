import type { Post } from "@/lib/db";

// Models and news get an internal detail page; everything else links
// straight out to its original source (no dedicated route for it).
export function postHref(post: Post): string {
  if (post.type === "model") return `/models/${post.slug}`;
  if (post.type === "news") return `/news/${post.slug}`;
  return post.original_url;
}

export function isExternal(post: Post): boolean {
  return post.type !== "model" && post.type !== "news";
}
