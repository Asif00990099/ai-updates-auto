export interface FeedConfig {
  name: string;
  url: string;
}

// Verify each URL resolves on first run; feed paths occasionally change.
// The ingest job skips any feed that errors, so a dead feed won't break the run.
export const FEEDS: FeedConfig[] = [
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml" },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml" },
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml" },
  { name: "Anthropic News", url: "https://www.anthropic.com/rss.xml" },
  { name: "Meta AI", url: "https://ai.meta.com/blog/rss/" },
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/" },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  { name: "Ars Technica AI", url: "https://arstechnica.com/ai/feed/" },
  {
    name: "MIT Tech Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
  },
];
