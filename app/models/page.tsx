import type { Metadata } from "next";
import Link from "next/link";
import { getTodaysModels } from "@/lib/posts";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "New AI Models Today",
  description:
    "Live leaderboard of new AI models published on Hugging Face in the last 24 hours, ranked by downloads.",
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default async function ModelsPage() {
  const models = await getTodaysModels();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">New AI Models Today</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Hugging Face models published in the last 24 hours, ranked by downloads.
      </p>

      {models.length === 0 ? (
        <p className="mt-10 text-neutral-400">No new models in the last 24 hours yet.</p>
      ) : (
        <ol className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {models.map((model, i) => {
            const meta = (model.meta ?? {}) as {
              downloads?: number;
              likes?: number;
              pipeline_tag?: string;
            };
            return (
              <li key={model.id}>
                <Link
                  href={`/models/${model.slug}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
                >
                  <span className="w-6 text-right text-sm font-semibold text-neutral-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-900">{model.title}</p>
                    {meta.pipeline_tag && (
                      <p className="text-xs text-neutral-400">{meta.pipeline_tag}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-4 text-sm text-neutral-500">
                    <span>{formatCount(meta.downloads ?? 0)} downloads</span>
                    <span>{formatCount(meta.likes ?? 0)} likes</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
