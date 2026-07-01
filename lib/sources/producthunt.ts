import type { NormalizedItem } from "./types";

const PH_URL = "https://api.producthunt.com/v2/api/graphql";

const QUERY = `
  query AITools {
    posts(first: 50, order: NEWEST, topic: "artificial-intelligence") {
      edges {
        node {
          id
          name
          tagline
          description
          url
          website
          votesCount
          createdAt
          thumbnail { url }
          user { name }
          topics { edges { node { name } } }
        }
      }
    }
  }
`;

interface PHNode {
  id: string;
  name: string;
  tagline: string;
  description: string | null;
  url: string;
  website: string | null;
  votesCount: number;
  createdAt: string;
  thumbnail: { url: string } | null;
  user: { name: string } | null;
  topics: { edges: Array<{ node: { name: string } }> };
}

// Product Hunt requires a developer token; without one this is a no-op
// so the ingest pipeline still runs on the free keyless sources.
export async function fetchProductHunt(): Promise<NormalizedItem[]> {
  const token = process.env.PRODUCTHUNT_TOKEN;
  if (!token) return [];

  const res = await fetch(PH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!res.ok) throw new Error(`Product Hunt API error: ${res.status}`);

  const data = await res.json();
  const edges: Array<{ node: PHNode }> = data?.data?.posts?.edges ?? [];

  return edges.map(({ node }) => ({
    source: "producthunt",
    type: "tool",
    title: node.name,
    url: node.website ?? node.url,
    image: node.thumbnail?.url ?? null,
    author: node.user?.name ?? null,
    meta: {
      votes: node.votesCount,
      tagline: node.tagline,
      topics: node.topics.edges.map((e) => e.node.name),
      producthunt_url: node.url,
    },
    publishedAt: node.createdAt,
    description: node.description ?? node.tagline,
  }));
}
