import type { Metadata } from "next";
import { getPostsByType } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI News",
  description: "The latest AI news headlines, rewritten and updated hourly.",
};

export default async function NewsPage() {
  const posts = await getPostsByType("news", 60);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">AI News</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Headlines from across the AI industry, updated every hour.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-neutral-400">No news yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
