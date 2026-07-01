interface RewriteResult {
  title: string;
  summary: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;|&#47;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Recover a JSON object from a model reply, tolerating code fences or stray
// prose around it (the reason Groq's strict json_object mode was dropped).
// Falls back to field-level regex so a reply truncated mid-summary still
// yields a usable title instead of losing the whole item.
function extractJson(content: string): { title?: unknown; summary?: unknown } | null {
  const cleaned = content.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      // fall through to regex salvage
    }
  }
  const title = cleaned.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
  const summary = cleaned.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
  if (title) {
    return { title, summary: summary || undefined };
  }
  return null;
}

function fallback(title: string, description: string | null): RewriteResult {
  const trimmed = stripHtml(description ?? "").slice(0, 280);
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
        max_tokens: 512,
        messages: [
          {
            role: "system",
            content:
              "You rewrite AI news items in original words for a news aggregator. " +
              "Never copy the source text verbatim. Reply with ONLY a JSON object of " +
              'the form {"title": "...", "summary": "..."} — no markdown, no code ' +
              "fences, no preamble. The title is a clean, concise headline. The " +
              "summary is 2-3 original sentences describing what happened and why it matters.",
          },
          {
            role: "user",
            // Cap the source text: only the gist is needed to rewrite, and long
            // inputs (e.g. full paper abstracts) waste tokens for no benefit.
            content: `Source title: ${title}\nSource description: ${(description ?? "(none)").slice(0, 600)}`,
          },
        ],
        // Note: we deliberately do NOT use response_format:json_object. Groq's
        // strict validator hard-fails (HTTP 400) when the model wraps its JSON
        // in a code fence, losing the whole item. We parse leniently instead.
      }),
    });

    if (!res.ok) {
      console.warn(`[rewrite] HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return fallback(title, description);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("[rewrite] no content in response");
      return fallback(title, description);
    }

    const parsed = extractJson(content);
    if (!parsed?.title) {
      console.warn(`[rewrite] could not parse JSON from: ${content.slice(0, 120)}`);
      return fallback(title, description);
    }

    // A salvaged reply may have a clean title but a truncated/missing summary;
    // keep the good title and back-fill the summary from the source text.
    const summary = parsed.summary
      ? String(parsed.summary)
      : fallback(title, description).summary;
    return { title: String(parsed.title), summary };
  } catch (err) {
    console.warn(`[rewrite] threw: ${err instanceof Error ? err.message : String(err)}`);
    return fallback(title, description);
  }
}
