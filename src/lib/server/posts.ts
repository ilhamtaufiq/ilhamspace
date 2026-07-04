import { randomUUID } from "node:crypto";

import { and, desc, eq, ne } from "drizzle-orm";

import { renderPostHtml } from "$lib/editor/render";
import { parseTags } from "$lib/schemas/post";
import { db } from "$lib/db/index";
import { type Post, posts } from "$lib/db/schema";
import { slugify } from "$lib/editor/slug";

export type PostInput = {
  title: string;
  slug: string;
  description?: string;
  tags?: string;
  status: "draft" | "published";
  contentJson: string;
};

export type ImportedPostInput = Omit<PostInput, "slug"> & {
  slug?: string;
  publishedAt?: Date | null;
};

const serializeTags = (raw: string | undefined): string | null => {
  const tags = parseTags(raw);
  return tags.length > 0 ? JSON.stringify(tags) : null;
};

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    return await db.select().from(posts).orderBy(desc(posts.updatedAt));
  } catch (error) {
    console.error("[server/posts] list error:", error);
    return [];
  }
};

export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("[server/posts] get by id error:", error);
    return null;
  }
};

export const isSlugTaken = async (
  slug: string,
  excludeId?: string,
): Promise<boolean> => {
  try {
    const condition = excludeId
      ? and(eq(posts.slug, slug), ne(posts.id, excludeId))
      : eq(posts.slug, slug);

    const rows = await db
      .select({ id: posts.id })
      .from(posts)
      .where(condition)
      .limit(1);

    return rows.length > 0;
  } catch (error) {
    console.error("[server/posts] slug check error:", error);
    return true;
  }
};

export const createImportedPost = async (
  input: ImportedPostInput,
): Promise<Post | null> => {
  try {
    const slug =
      slugify(input.slug ?? input.title) || slugify(input.title) || "post";

    if (await isSlugTaken(slug)) {
      return null;
    }

    const now = new Date();
    const contentHtml = renderPostHtml(input.contentJson);
    const publishedAt =
      input.status === "published"
        ? (input.publishedAt ?? now)
        : null;
    const createdAt = input.publishedAt ?? now;

    const rows = await db
      .insert(posts)
      .values({
        id: randomUUID(),
        title: input.title,
        slug,
        description: input.description ?? null,
        contentJson: input.contentJson,
        contentHtml,
        tags: serializeTags(input.tags),
        status: input.status,
        publishedAt,
        createdAt,
        updatedAt: publishedAt ?? now,
      })
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error("[server/posts] import create error:", error);
    return null;
  }
};

export const createPost = async (input: PostInput): Promise<Post | null> => {
  try {
    const now = new Date();
    const contentHtml = renderPostHtml(input.contentJson);

    const rows = await db
      .insert(posts)
      .values({
        id: randomUUID(),
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        contentJson: input.contentJson,
        contentHtml,
        tags: serializeTags(input.tags),
        status: input.status,
        publishedAt: input.status === "published" ? now : null,
        updatedAt: now,
      })
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error("[server/posts] create error:", error);
    return null;
  }
};

export const updatePost = async (
  id: string,
  input: PostInput,
): Promise<Post | null> => {
  try {
    const existing = await getPostById(id);
    if (!existing) {
      return null;
    }

    const now = new Date();
    const contentHtml = renderPostHtml(input.contentJson);
    const publishedAt =
      input.status === "published"
        ? (existing.publishedAt ?? now)
        : null;

    const rows = await db
      .update(posts)
      .set({
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        contentJson: input.contentJson,
        contentHtml,
        tags: serializeTags(input.tags),
        status: input.status,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(posts.id, id))
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error("[server/posts] update error:", error);
    return null;
  }
};

export const deletePost = async (id: string): Promise<boolean> => {
  try {
    await db.delete(posts).where(eq(posts.id, id));
    return true;
  } catch (error) {
    console.error("[server/posts] delete error:", error);
    return false;
  }
};