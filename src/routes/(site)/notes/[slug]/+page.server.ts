import { fail, redirect, error } from "@sveltejs/kit";

import { checkRateLimit } from "$lib/auth/rate-limit";
import { getVoterKey } from "$lib/comments/voter";
import { parseCommentSort } from "$lib/comments/constants";
import {
  canReplyToComment,
  createComment,
  getCommentById,
  getCommentCountByPostId,
  getCommentsByPostId,
  setCommentVote,
} from "$lib/db/comments";
import { broadcastVoteUpdate } from "$lib/server/broadcast-vote";
import { getPostBySlug } from "$lib/db/posts";
import { translate } from "$lib/i18n";
import { commentSchema, voteSchema } from "$lib/schemas/comment";
import { stripHtml, truncateDescription } from "$lib/seo/meta";

import type { Actions, PageServerLoad } from "./$types";

const buildNotePath = (slug: string, sort?: string, hash?: string): string => {
  const query = sort && sort !== "new" ? `?sort=${sort}` : "";
  const fragment = hash ? `#${hash}` : "";
  return `/notes/${slug}${query}${fragment}`;
};

export const load: PageServerLoad = async ({
  params,
  locals,
  url,
  getClientAddress,
}) => {
  const post = await getPostBySlug(params.slug);

  if (!post || post.status !== "published") {
    error(404, "Post not found");
  }

  const publishedAt = post.publishedAt ?? post.createdAt;
  const modifiedAt = post.updatedAt ?? publishedAt;
  const seoDescription =
    post.description?.trim() ||
    truncateDescription(stripHtml(post.contentHtml));

  const commentSort = parseCommentSort(url.searchParams.get("sort"));
  const voterKey = getVoterKey(getClientAddress());

  const [comments, commentCount] = await Promise.all([
    getCommentsByPostId(post.id, { voterKey }),
    getCommentCountByPostId(post.id),
  ]);

  return {
    post,
    canEdit: locals.user?.isAdmin ?? false,
    seoDescription,
    seoPublishedAt: publishedAt.toISOString(),
    seoModifiedAt: modifiedAt.toISOString(),
    comments,
    commentCount,
    commentSort,
    commentsDisabled: post.noComments,
  };
};

export const actions: Actions = {
  comment: async (event) => {
    const post = await getPostBySlug(event.params.slug);

    if (!post || post.status !== "published") {
      error(404, "Post not found");
    }

    if (post.noComments) {
      return fail(403, {
        commentError: translate(event.locals.locale, "comments.errorDisabled"),
        authorName: "",
        authorEmail: "",
      });
    }

    const clientIp = event.getClientAddress();
    if (!checkRateLimit(`comment:${clientIp}`, 10, 15 * 60 * 1000)) {
      return fail(429, {
        commentError: translate(event.locals.locale, "comments.errorRateLimit"),
        authorName: "",
        authorEmail: "",
      });
    }

    const formData = await event.request.formData();
    const raw = {
      authorName: String(formData.get("authorName") ?? ""),
      authorEmail: String(formData.get("authorEmail") ?? ""),
      body: String(formData.get("body") ?? ""),
      parentId: String(formData.get("parentId") ?? "") || undefined,
    };

    const parsed = commentSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        commentError: translate(event.locals.locale, "comments.errorInvalid"),
        authorName: raw.authorName,
        authorEmail: raw.authorEmail,
      });
    }

    if (parsed.data.parentId) {
      const parent = await getCommentById(parsed.data.parentId);
      if (!parent || parent.postId !== post.id) {
        return fail(400, {
          commentError: translate(event.locals.locale, "comments.errorInvalid"),
          authorName: parsed.data.authorName,
          authorEmail: parsed.data.authorEmail,
        });
      }

      const replyAllowed = await canReplyToComment(parsed.data.parentId);
      if (!replyAllowed) {
        return fail(400, {
          commentError: translate(event.locals.locale, "comments.errorMaxDepth"),
          authorName: parsed.data.authorName,
          authorEmail: parsed.data.authorEmail,
        });
      }
    }

    const created = await createComment({
      postId: post.id,
      parentId: parsed.data.parentId,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      body: parsed.data.body,
    });

    if (!created) {
      return fail(500, {
        commentError: translate(event.locals.locale, "comments.errorFailed"),
        authorName: parsed.data.authorName,
        authorEmail: parsed.data.authorEmail,
      });
    }

    throw redirect(303, buildNotePath(post.slug, undefined, `comment-${created.id}`));
  },

  vote: async (event) => {
    const post = await getPostBySlug(event.params.slug);

    if (!post || post.status !== "published") {
      error(404, "Post not found");
    }

    if (post.noComments) {
      return fail(403, {
        voteError: translate(event.locals.locale, "comments.errorDisabled"),
      });
    }

    const clientIp = event.getClientAddress();
    if (!checkRateLimit(`vote:${clientIp}`, 60, 15 * 60 * 1000)) {
      return fail(429, {
        voteError: translate(event.locals.locale, "comments.errorVoteRateLimit"),
      });
    }

    const formData = await event.request.formData();
    const raw = {
      commentId: String(formData.get("commentId") ?? ""),
      vote: formData.get("vote"),
    };

    const parsed = voteSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        voteError: translate(event.locals.locale, "comments.errorVoteInvalid"),
      });
    }

    const comment = await getCommentById(parsed.data.commentId);
    if (!comment || comment.postId !== post.id) {
      return fail(400, {
        voteError: translate(event.locals.locale, "comments.errorVoteInvalid"),
      });
    }

    const voterKey = getVoterKey(clientIp);
    const updated = await setCommentVote(
      parsed.data.commentId,
      voterKey,
      parsed.data.vote as 1 | -1,
    );

    if (!updated) {
      return fail(500, {
        voteError: translate(event.locals.locale, "comments.errorVoteFailed"),
      });
    }

    broadcastVoteUpdate(post.id, {
      commentId: updated.id,
      score: updated.score,
      upvotes: updated.upvotes,
      downvotes: updated.downvotes,
    });

    return {
      vote: {
        commentId: updated.id,
        score: updated.score,
        upvotes: updated.upvotes,
        downvotes: updated.downvotes,
        userVote: updated.userVote,
      } as const,
    };
  },
};