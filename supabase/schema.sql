create table posts (
  id           bigint generated always as identity primary key,
  source       text not null,        -- 'huggingface' | 'arxiv' | 'rss' | 'hn' | 'github' | 'producthunt'
  type         text not null,        -- 'model' | 'paper' | 'news' | 'repo' | 'tool'
  title        text not null,
  slug         text not null unique,
  summary      text,                 -- AI-rewritten
  original_url text not null,
  image_url    text,
  author       text,
  meta         jsonb,                -- source-specific extras (downloads, likes, stars, etc.)
  content_hash text not null unique, -- dedupe key
  published_at timestamptz,
  created_at   timestamptz default now()
);

create index posts_type_pub_idx on posts (type, published_at desc);
create index posts_created_idx  on posts (created_at desc);
