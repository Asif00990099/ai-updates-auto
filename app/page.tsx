import { getLatestPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const revalidate = 3600;

export default async function HomePage() {
  const posts = await getLatestPosts(30);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Latest AI Updates</h1>
      <p className="mt-1 text-sm text-neutral-500">
        New models, papers, news, and tool launches, ingested automatically every hour.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-neutral-400">No posts yet — check back soon.</p>
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
