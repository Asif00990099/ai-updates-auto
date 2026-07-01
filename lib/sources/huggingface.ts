import type { NormalizedItem } from "./types";

interface HFModel {
  id: string;
  likes?: number;
  downloads?: number;
  pipeline_tag?: string;
  tags?: string[];
  createdAt?: string;
}

const HF_URL =
  "https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=50";

export async function fetchHuggingFace(): Promise<NormalizedItem[]> {
  const res = await fetch(HF_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HuggingFace API error: ${res.status}`);

  const models: HFModel[] = await res.json();

  return models.map((model) => {
    const author = model.id.includes("/") ? model.id.split("/")[0] : null;
    return {
      source: "huggingface",
      type: "model",
      title: model.id,
      url: `https://huggingface.co/${model.id}`,
      image: null,
      author,
      meta: {
        downloads: model.downloads ?? 0,
        likes: model.likes ?? 0,
        pipeline_tag: model.pipeline_tag ?? null,
        tags: model.tags ?? [],
      },
      publishedAt: model.createdAt ?? null,
      description: model.pipeline_tag
        ? `A new ${model.pipeline_tag} model on Hugging Face.`
        : "A new model on Hugging Face.",
    };
  });
}
