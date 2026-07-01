import { createHash } from "crypto";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

// Appends a short hash of the source URL so identical titles from
// different sources never collide on the unique slug column.
export function toSeoSlug(title: string, uniqueKey: string): string {
  const base = slugify(title) || "post";
  const hash = createHash("sha256").update(uniqueKey).digest("hex").slice(0, 8);
  return `${base}-${hash}`;
}
