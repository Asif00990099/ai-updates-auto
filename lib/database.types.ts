import type { PostSource, PostType } from "@/lib/db";

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: number;
          source: PostSource;
          type: PostType;
          title: string;
          slug: string;
          summary: string | null;
          original_url: string;
          image_url: string | null;
          author: string | null;
          meta: Record<string, unknown> | null;
          content_hash: string;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          source: PostSource;
          type: PostType;
          title: string;
          slug: string;
          summary?: string | null;
          original_url: string;
          image_url?: string | null;
          author?: string | null;
          meta?: Record<string, unknown> | null;
          content_hash: string;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          source?: PostSource;
          type?: PostType;
          title?: string;
          slug?: string;
          summary?: string | null;
          original_url?: string;
          image_url?: string | null;
          author?: string | null;
          meta?: Record<string, unknown> | null;
          content_hash?: string;
          published_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
