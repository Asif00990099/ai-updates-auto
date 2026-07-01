import type { Metadata } from "next";
import { getPostsByType } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Research Papers",
  description: "Newly published AI research papers from arXiv, updated hourly.",
};

export default async function PapersPage() {
  const posts = await getPostsByType("paper", 60);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">AI Research Papers</h1>
      <p className="mt-1 text-sm text-neutral-500">
        New arXiv submissions in cs.AI, cs.LG, and cs.CL.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-neutral-400">No papers yet — check back soon.</p>
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
