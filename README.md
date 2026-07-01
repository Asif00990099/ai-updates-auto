# AI Pulse

Hands-free AI news automation. A Next.js 15 site that ingests new AI models,
research papers, news, and tool launches every hour from free, keyless
sources, rewrites them with Groq, and publishes SEO pages — no manual
posting.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript), Tailwind CSS
- **Host:** Vercel
- **Database:** Supabase (Postgres)
- **AI rewrite:** Groq (`llama-3.3-70b-versatile`, OpenAI-compatible, free tier)
- **Cron trigger:** GitHub Actions (hourly, free, unlimited frequency)

## Sources

| Source | Content | Key needed |
|---|---|:---:|
| Hugging Face Hub | New models | No |
| arXiv | New papers (cs.AI, cs.LG, cs.CL) | No |
| RSS (`lib/feeds.config.ts`) | AI news | No |
| Hacker News (Algolia) | AI stories | No |
| GitHub | Trending `topic:llm` repos | Optional |
| Product Hunt | New AI tools | Yes (free) |

## Setup

1. **Supabase** — create a project, run [`supabase/schema.sql`](supabase/schema.sql)
   in the SQL editor, then copy the project URL and `service_role` key.
2. **Groq** — get a free API key at [console.groq.com](https://console.groq.com).
3. **Env vars** — copy `.env.example` to `.env.local` and fill in:
   ```
   SUPABASE_URL=
   SUPABASE_SERVICE_KEY=
   GROQ_API_KEY=
   GITHUB_TOKEN=          # optional
   PRODUCTHUNT_TOKEN=     # optional
   CRON_SECRET=           # random string, guards /api/cron/ingest
   NEXT_PUBLIC_SITE_URL=  # your deployed domain, used by sitemap/robots
   ```
4. **Install & run locally:**
   ```bash
   npm install
   npm run dev
   ```
5. **Trigger an ingest run manually:**
   ```bash
   curl "http://localhost:3000/api/cron/ingest?secret=YOUR_CRON_SECRET"
   ```
   Returns `{ fetched, inserted, skipped }`.
6. **Deploy to Vercel** and set the same env vars there.
7. **Enable the cron:** add `CRON_SECRET` as a GitHub Actions secret on this
   repo, update the domain in
   [`.github/workflows/cron.yml`](.github/workflows/cron.yml), then enable
   the workflow. It pings `/api/cron/ingest` every hour.

## Structure

```
app/
  page.tsx                 # homepage: latest 30 posts
  models/page.tsx          # "New AI Models Today" leaderboard (the moat)
  models/[slug]/page.tsx
  news/page.tsx
  news/[slug]/page.tsx
  papers/page.tsx
  tools/page.tsx            # Product Hunt directory, filterable by topic
  sitemap.ts, robots.ts
  api/cron/ingest/route.ts  # automation entrypoint
lib/
  sources/                 # one fetcher per source, normalized output
  rewrite.ts               # Groq summarizer, falls back to raw text on error
  dedupe.ts                # sha256(source + url) content hash
  slug.ts                  # SEO slug + hash suffix
  posts.ts                 # read queries used by pages
  db.ts                    # Supabase client
supabase/schema.sql
.github/workflows/cron.yml
```

## Content policy

Every post links back to its original source. Summaries are AI-rewritten,
never a copy of the source text — see `lib/rewrite.ts`. Papers, repos, and
tools link straight to their source instead of duplicating a detail page.
