import { fail } from "@sveltejs/kit";

import {
  deleteCommentWithReplies,
  getAdminComments,
} from "$lib/db/comments";
import { getAllPosts } from "$lib/server/posts";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const postId = url.searchParams.get("post")?.trim() || undefined;

  const [comments, posts] = await Promise.all([
    getAdminComments({ postId }),
    getAllPosts(),
  ]);

  const activePost = postId
    ? posts.find((post) => post.id === postId) ?? null
    : null;

  return {
    comments,
    posts,
    filterPostId: postId ?? null,
    activePost,
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return fail(400, { deleteError: "Comment id is required." });
    }

    const deleted = await deleteCommentWithReplies(id);
    if (!deleted) {
      return fail(404, { deleteError: "Comment not found." });
    }

    return { success: true };
  },
};