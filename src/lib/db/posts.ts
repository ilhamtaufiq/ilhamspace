import { desc, eq } from "drizzle-orm";

import { db } from "$lib/db/index";
import { type Post, posts } from "$lib/db/schema";

export const getPublishedPosts = async (): Promise<Post[]> => {
  try {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt));
  } catch (error) {
    console.error("[db/posts] error fetching published posts:", error);
    return [];
  }
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    const rows = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("[db/posts] error fetching post:", error);
    return null;
  }
};