import { fail } from "@sveltejs/kit";

import {
  deleteCommentWithReplies,
  getAdminComments,
  getTotalCommentCount,
} from "$lib/db/comments";
import { getAllPosts } from "$lib/server/posts";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [totalComments, recentComments, posts] = await Promise.all([
    getTotalCommentCount(),
    getAdminComments({ limit: 8 }),
    getAllPosts(),
  ]);

  const publishedPosts = posts.filter((post) => post.status === "published");

  return {
    totalComments,
    recentComments,
    publishedPostCount: publishedPosts.length,
    draftPostCount: posts.length - publishedPosts.length,
  };
};

export const actions: Actions = {
  deleteComment: async ({ request }) => {
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