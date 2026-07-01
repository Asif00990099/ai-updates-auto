import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import TypeBadge from "@/components/TypeBadge";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary ?? post.title,
    alternates: { canonical: post.original_url },
  };
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.type !== "model") notFound();

  const meta = (post.meta ?? {}) as {
    downloads?: number;
    likes?: number;
    pipeline_tag?: string;
    tags?: string[];
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: post.title,
    description: post.summary,
    applicationCategory: meta.pipeline_tag ?? "AI Model",
    url: post.original_url,
    author: post.author ? { "@type": "Organization", name: post.author } : undefined,
    datePublished: post.published_at,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TypeBadge type={post.type} />
      <h1 className="mt-3 text-3xl font-bold text-neutral-900">{post.title}</h1>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
        {post.author && <span>By {post.author}</span>}
        {meta.pipeline_tag && <span>{meta.pipeline_tag}</span>}
        <span>{(meta.downloads ?? 0).toLocaleString()} downloads</span>
        <span>{(meta.likes ?? 0).toLocaleString()} likes</span>
      </div>

      {post.summary && (
        <p className="mt-6 text-lg leading-relaxed text-neutral-700">{post.summary}</p>
      )}

      {meta.tags && meta.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {meta.tags.slice(0, 10).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <a
        href={post.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        View on Hugging Face ↗
      </a>
    </article>
  );
}
