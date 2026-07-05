import { randomUUID } from "node:crypto";

import { and, count, desc, eq, inArray } from "drizzle-orm";

import { getCommentAvatar } from "$lib/comments/avatar";
import { MAX_COMMENT_DEPTH } from "$lib/comments/constants";
import type { PublicComment, UserVote } from "$lib/comments/tree";
import { db } from "$lib/db/index";
import {
  type Comment,
  commentVotes,
  comments,
  posts,
} from "$lib/db/schema";

export type AdminCommentListItem = {
  id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  body: string;
  createdAt: Date;
  score: number;
  upvotes: number;
  downvotes: number;
};

const collectDescendantIds = (
  rootId: string,
  rows: Comment[],
): string[] => {
  const ids = new Set<string>([rootId]);
  let added = true;

  while (added) {
    added = false;
    for (const row of rows) {
      if (row.parentId && ids.has(row.parentId) && !ids.has(row.id)) {
        ids.add(row.id);
        added = true;
      }
    }
  }

  return [...ids];
};

export type CreateCommentInput = {
  postId: string;
  parentId?: string;
  authorName: string;
  authorEmail: string;
  body: string;
};

export type VoteValue = 1 | -1;

type VoteAggregate = {
  score: number;
  upvotes: number;
  downvotes: number;
  userVote: UserVote;
};

const emptyVoteAggregate = (): VoteAggregate => ({
  score: 0,
  upvotes: 0,
  downvotes: 0,
  userVote: null,
});

const getVoteAggregates = async (
  commentIds: string[],
  voterKey?: string,
): Promise<Map<string, VoteAggregate>> => {
  const map = new Map<string, VoteAggregate>();

  if (commentIds.length === 0) {
    return map;
  }

  try {
    const rows = await db
      .select()
      .from(commentVotes)
      .where(inArray(commentVotes.commentId, commentIds));

    for (const id of commentIds) {
      map.set(id, emptyVoteAggregate());
    }

    for (const row of rows) {
      const aggregate = map.get(row.commentId) ?? emptyVoteAggregate();

      if (row.vote === 1) {
        aggregate.upvotes += 1;
        aggregate.score += 1;
      } else if (row.vote === -1) {
        aggregate.downvotes += 1;
        aggregate.score -= 1;
      }

      if (voterKey && row.voterKey === voterKey) {
        aggregate.userVote = row.vote === 1 ? 1 : -1;
      }

      map.set(row.commentId, aggregate);
    }

    return map;
  } catch (error) {
    console.error("[db/comments] error fetching vote aggregates:", error);
    return map;
  }
};

const toPublicComment = (
  comment: Comment,
  votes: VoteAggregate = emptyVoteAggregate(),
): PublicComment => ({
  id: comment.id,
  parentId: comment.parentId,
  authorName: comment.authorName,
  body: comment.body,
  createdAt: comment.createdAt.toISOString(),
  avatar: getCommentAvatar(comment.authorEmail),
  score: votes.score,
  upvotes: votes.upvotes,
  downvotes: votes.downvotes,
  userVote: votes.userVote,
});

export const getCommentsByPostId = async (
  postId: string,
  options?: { voterKey?: string },
): Promise<PublicComment[]> => {
  try {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    const voteMap = await getVoteAggregates(
      rows.map((row) => row.id),
      options?.voterKey,
    );

    return rows.map((row) =>
      toPublicComment(row, voteMap.get(row.id) ?? emptyVoteAggregate()),
    );
  } catch (error) {
    console.error("[db/comments] error fetching comments:", error);
    return [];
  }
};

export const getCommentCountByPostId = async (postId: string): Promise<number> => {
  try {
    const rows = await db
      .select({ total: count() })
      .from(comments)
      .where(eq(comments.postId, postId));

    return rows[0]?.total ?? 0;
  } catch (error) {
    console.error("[db/comments] error counting comments:", error);
    return 0;
  }
};

export const getCommentCountsByPostIds = async (
  postIds: string[],
): Promise<Record<string, number>> => {
  if (postIds.length === 0) {
    return {};
  }

  try {
    const rows = await db
      .select({
        postId: comments.postId,
        total: count(),
      })
      .from(comments)
      .where(inArray(comments.postId, postIds))
      .groupBy(comments.postId);

    return Object.fromEntries(rows.map((row) => [row.postId, row.total]));
  } catch (error) {
    console.error("[db/comments] error counting comments by post:", error);
    return {};
  }
};

export const getCommentById = async (id: string): Promise<Comment | null> => {
  try {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    console.error("[db/comments] error fetching comment:", error);
    return null;
  }
};

export const getCommentDepthById = async (commentId: string): Promise<number> => {
  let depth = 0;
  let currentId: string | null = commentId;

  while (currentId) {
    const comment = await getCommentById(currentId);
    if (!comment?.parentId) {
      break;
    }

    depth += 1;
    currentId = comment.parentId;

    if (depth >= MAX_COMMENT_DEPTH) {
      break;
    }
  }

  return depth;
};

export const canReplyToComment = async (parentId: string): Promise<boolean> => {
  const depth = await getCommentDepthById(parentId);
  return depth < MAX_COMMENT_DEPTH - 1;
};

export type ImportedCommentInput = CreateCommentInput & {
  createdAt: Date;
};

export const commentExistsForImport = async (
  postId: string,
  authorEmail: string,
  body: string,
  createdAt: Date,
): Promise<boolean> => {
  try {
    const rows = await db
      .select({ id: comments.id })
      .from(comments)
      .where(
        and(
          eq(comments.postId, postId),
          eq(comments.authorEmail, authorEmail),
          eq(comments.body, body),
          eq(comments.createdAt, createdAt),
        ),
      )
      .limit(1);

    return rows.length > 0;
  } catch (error) {
    console.error("[db/comments] import duplicate check error:", error);
    return false;
  }
};

export const createImportedComment = async (
  input: ImportedCommentInput,
): Promise<Comment | null> => {
  try {
    const id = randomUUID();
    const rows = await db
      .insert(comments)
      .values({
        id,
        postId: input.postId,
        parentId: input.parentId ?? null,
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        body: input.body,
        createdAt: input.createdAt,
      })
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error("[db/comments] import create error:", error);
    return null;
  }
};

export const createComment = async (
  input: CreateCommentInput,
): Promise<PublicComment | null> => {
  try {
    const id = randomUUID();
    const rows = await db
      .insert(comments)
      .values({
        id,
        postId: input.postId,
        parentId: input.parentId ?? null,
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        body: input.body,
      })
      .returning();

    const comment = rows[0];
    return comment ? toPublicComment(comment) : null;
  } catch (error) {
    console.error("[db/comments] error creating comment:", error);
    return null;
  }
};

export const setCommentVote = async (
  commentId: string,
  voterKey: string,
  vote: VoteValue,
): Promise<PublicComment | null> => {
  try {
    const comment = await getCommentById(commentId);
    if (!comment) {
      return null;
    }

    const existing = await db
      .select()
      .from(commentVotes)
      .where(
        and(
          eq(commentVotes.commentId, commentId),
          eq(commentVotes.voterKey, voterKey),
        ),
      )
      .limit(1);

    const current = existing[0];

    if (current?.vote === vote) {
      await db.delete(commentVotes).where(eq(commentVotes.id, current.id));
    } else if (current) {
      await db
        .update(commentVotes)
        .set({ vote })
        .where(eq(commentVotes.id, current.id));
    } else {
      await db.insert(commentVotes).values({
        id: randomUUID(),
        commentId,
        voterKey,
        vote,
      });
    }

    const voteMap = await getVoteAggregates([commentId], voterKey);
    return toPublicComment(comment, voteMap.get(commentId) ?? emptyVoteAggregate());
  } catch (error) {
    console.error("[db/comments] error setting vote:", error);
    return null;
  }
};

export const getTotalCommentCount = async (): Promise<number> => {
  try {
    const rows = await db.select({ total: count() }).from(comments);
    return rows[0]?.total ?? 0;
  } catch (error) {
    console.error("[db/comments] error counting all comments:", error);
    return 0;
  }
};

export const getAdminCommentCount = async (postId?: string): Promise<number> => {
  try {
    let query = db.select({ total: count() }).from(comments).$dynamic();

    if (postId) {
      query = query.where(eq(comments.postId, postId));
    }

    const rows = await query;
    return rows[0]?.total ?? 0;
  } catch (error) {
    console.error("[db/comments] error counting admin comments:", error);
    return 0;
  }
};

export const getAdminComments = async (options?: {
  limit?: number;
  offset?: number;
  postId?: string;
}): Promise<AdminCommentListItem[]> => {
  try {
    let query = db
      .select({
        id: comments.id,
        postId: comments.postId,
        postTitle: posts.title,
        postSlug: posts.slug,
        parentId: comments.parentId,
        authorName: comments.authorName,
        authorEmail: comments.authorEmail,
        body: comments.body,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .innerJoin(posts, eq(comments.postId, posts.id))
      .orderBy(desc(comments.createdAt))
      .$dynamic();

    if (options?.postId) {
      query = query.where(eq(comments.postId, options.postId));
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const rows = await query;
    const voteMap = await getVoteAggregates(rows.map((row) => row.id));

    return rows.map((row) => {
      const votes = voteMap.get(row.id) ?? emptyVoteAggregate();
      return {
        ...row,
        score: votes.score,
        upvotes: votes.upvotes,
        downvotes: votes.downvotes,
      };
    });
  } catch (error) {
    console.error("[db/comments] error listing admin comments:", error);
    return [];
  }
};

export const deleteCommentWithReplies = async (
  commentId: string,
): Promise<boolean> => {
  try {
    const comment = await getCommentById(commentId);
    if (!comment) {
      return false;
    }

    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, comment.postId));

    const idsToDelete = collectDescendantIds(commentId, rows);
    if (idsToDelete.length === 0) {
      return false;
    }

    await db
      .delete(commentVotes)
      .where(inArray(commentVotes.commentId, idsToDelete));
    await db.delete(comments).where(inArray(comments.id, idsToDelete));

    return true;
  } catch (error) {
    console.error("[db/comments] error deleting comment:", error);
    return false;
  }
};