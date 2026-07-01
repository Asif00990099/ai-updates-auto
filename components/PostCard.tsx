import Link from "next/link";
import type { Post } from "@/lib/db";
import { postHref, isExternal } from "@/lib/link";
import TypeBadge from "./TypeBadge";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function PostCard({ post }: { post: Post }) {
  const href = postHref(post);
  const external = isExternal(post);

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-400 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <TypeBadge type={post.type} />
        <span className="text-xs text-neutral-400">{timeAgo(post.published_at)}</span>
      </div>
      <h3 className="line-clamp-2 font-semibold leading-snug text-neutral-900">
        {post.title}
      </h3>
      {post.summary && (
        <p className="line-clamp-2 text-sm text-neutral-600">{post.summary}</p>
      )}
      <div className="mt-auto flex items-center justify-between text-xs text-neutral-400">
        <span className="truncate">{post.author ?? post.source}</span>
        {external && <span>↗ source</span>}
      </div>
    </Link>
  );
}
