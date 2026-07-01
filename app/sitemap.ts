import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

// Only "model" and "news" posts have an internal detail page; other
// types link straight out to their source and don't belong in the sitemap.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/models`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/news`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/papers`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${SITE_URL}/tools`, changeFrequency: "hourly", priority: 0.7 },
  ];

  const rows = await getAllSlugs();
  const postRoutes = rows
    .filter((row) => row.type === "model" || row.type === "news")
    .map((row) => ({
      url: `${SITE_URL}/${row.type === "model" ? "models" : "news"}/${row.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...postRoutes];
}
