import type { Metadata } from "next";
import { getPostsByType } from "@/lib/posts";
import ToolsGrid from "@/components/ToolsGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Tools Directory",
  description: "New AI tool launches from Product Hunt, filterable by category.",
};

export default async function ToolsPage() {
  const posts = await getPostsByType("tool", 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">AI Tools Directory</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Newly launched AI tools and products, filterable by category.
      </p>

      <ToolsGrid posts={posts} />
    </div>
  );
}
