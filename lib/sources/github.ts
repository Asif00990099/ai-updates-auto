import type { NormalizedItem } from "./types";

const GITHUB_URL =
  "https://api.github.com/search/repositories?q=topic:llm&sort=stars&order=desc";

interface GitHubRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  owner: { login: string; avatar_url: string | null };
  stargazers_count: number;
  language: string | null;
  created_at: string;
  pushed_at: string;
}

export async function fetchGitHub(): Promise<NormalizedItem[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(GITHUB_URL, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data: { items: GitHubRepo[] } = await res.json();

  return (data.items ?? []).map((repo) => ({
    source: "github",
    type: "repo",
    title: repo.full_name,
    url: repo.html_url,
    image: repo.owner.avatar_url,
    author: repo.owner.login,
    meta: { stars: repo.stargazers_count, language: repo.language },
    publishedAt: repo.pushed_at ?? repo.created_at,
    description: repo.description,
  }));
}
