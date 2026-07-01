"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/db";
import PostCard from "./PostCard";

export default function ToolsGrid({ posts }: { posts: Post[] }) {
  const [topic, setTopic] = useState<string>("all");

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const post of posts) {
      const t = (post.meta as { topics?: string[] } | null)?.topics ?? [];
      t.forEach((topic) => set.add(topic));
    }
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (topic === "all") return posts;
    return posts.filter((post) => {
      const t = (post.meta as { topics?: string[] } | null)?.topics ?? [];
      return t.includes(topic);
    });
  }, [posts, topic]);

  if (posts.length === 0) {
    return (
      <p className="mt-10 text-neutral-400">
        No tools yet — add a PRODUCTHUNT_TOKEN to start ingesting launches.
      </p>
    );
  }

  return (
    <div>
      {topics.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTopic("all")}
            className={`rounded-full px-3 py-1 text-sm ${
              topic === "all"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`rounded-full px-3 py-1 text-sm ${
                topic === t
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
