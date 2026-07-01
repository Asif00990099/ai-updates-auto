interface RewriteResult {
  title: string;
  summary: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function fallback(title: string, description: string | null): RewriteResult {
  const trimmed = (description ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
  return {
    title,
    summary: trimmed || title,
  };
}

// Produces an original headline + 2-3 sentence summary via Groq.
// Never fails the caller: any API error falls back to the raw source text.
export async function rewrite(
  title: string,
  description: string | null
): Promise<RewriteResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallback(title, description);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You rewrite AI news items in original words for a news aggregator. " +
              "Never copy the source text verbatim. Respond with strict JSON only: " +
              '{"title": "...", "summary": "..."}. The title is a clean, concise ' +
              "headline. The summary is 2-3 original sentences describing what happened " +
              "and why it matters. No markdown, no preamble.",
          },
          {
            role: "user",
            content: `Source title: ${title}\nSource description: ${description ?? "(none)"}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return fallback(title, description);

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return fallback(title, description);

    const parsed = JSON.parse(content);
    if (!parsed?.title || !parsed?.summary) return fallback(title, description);

    return { title: String(parsed.title), summary: String(parsed.summary) };
  } catch {
    return fallback(title, description);
  }
}
