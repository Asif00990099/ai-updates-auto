import type { PostType } from "@/lib/db";

const LABELS: Record<PostType, string> = {
  model: "Model",
  paper: "Paper",
  news: "News",
  repo: "Repo",
  tool: "Tool",
};

const STYLES: Record<PostType, string> = {
  model: "bg-violet-100 text-violet-700",
  paper: "bg-blue-100 text-blue-700",
  news: "bg-amber-100 text-amber-700",
  repo: "bg-emerald-100 text-emerald-700",
  tool: "bg-rose-100 text-rose-700",
};

export default function TypeBadge({ type }: { type: PostType }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
