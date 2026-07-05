import { randomUUID } from "node:crypto";

import { and, count, desc, eq, inArray, ne } from "drizzle-orm";

import {
  ADMIN_LIST_PER_PAGE,
  buildAdminPaginationMeta,
  clampAdminPage,
} from "$lib/admin/pagination";
import { renderPostHtml } from "$lib/editor/render";
import { parseTags } from "$lib/schemas/post";
import { db } from "$lib/db/index";
import { commentVotes, comments, type Post, posts } from "$lib/db/schema";
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

export const getPostStatusCounts = async (): Promise<{
  published: number;
  draft: number;
  total: number;
}> => {
  try {
    const rows = await db
      .select({
        status: posts.status,
        total: count(),
      })
      .from(posts)
      .groupBy(posts.status);

    let published = 0;
    let draft = 0;

    for (const row of rows) {
      if (row.status === "published") {
        published = row.total;
      } else if (row.status === "draft") {
        draft = row.total;
      }
    }

    return {
      published,
      draft,
      total: published + draft,
    };
  } catch (error) {
    console.error("[server/posts] status count error:", error);
    return { published: 0, draft: 0, total: 0 };
  }
};

export const getAdminPostsPage = async (
  requestedPage: number,
  perPage: number = ADMIN_LIST_PER_PAGE,
): Promise<{
  posts: Post[];
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}> => {
  try {
    const countRows = await db.select({ total: count() }).from(posts);
    const totalItems = countRows[0]?.total ?? 0;
    const meta = buildAdminPaginationMeta(totalItems, requestedPage, perPage);
    const offset = (meta.page - 1) * perPage;

    const rows = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.updatedAt))
      .limit(perPage)
      .offset(offset);

    return {
      posts: rows,
      ...meta,
    };
  } catch (error) {
    console.error("[server/posts] admin page error:", error);
    const page = clampAdminPage(requestedPage, 1);
    return {
      posts: [],
      page,
      totalPages: 1,
      totalItems: 0,
      perPage,
    };
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
    const postComments = await db
      .select({ id: comments.id })
      .from(comments)
      .where(eq(comments.postId, id));

    const commentIds = postComments.map((row) => row.id);

    if (commentIds.length > 0) {
      await db
        .delete(commentVotes)
        .where(inArray(commentVotes.commentId, commentIds));
      await db.delete(comments).where(eq(comments.postId, id));
    }

    const deleted = await db.delete(posts).where(eq(posts.id, id)).returning({
      id: posts.id,
    });

    return deleted.length > 0;
  } catch (error) {
    console.error("[server/posts] delete error:", error);
    return false;
  }
};