import { fail } from "@sveltejs/kit";

import {
  ADMIN_LIST_PER_PAGE,
  buildAdminPaginationMeta,
  parseAdminPageParam,
} from "$lib/admin/pagination";
import {
  deleteCommentWithReplies,
  getAdminCommentCount,
  getAdminComments,
} from "$lib/db/comments";
import { getAllPosts } from "$lib/server/posts";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const postId = url.searchParams.get("post")?.trim() || undefined;
  const requestedPage = parseAdminPageParam(url.searchParams);

  const [totalItems, posts] = await Promise.all([
    getAdminCommentCount(postId),
    getAllPosts(),
  ]);

  const meta = buildAdminPaginationMeta(
    totalItems,
    requestedPage,
    ADMIN_LIST_PER_PAGE,
  );
  const offset = (meta.page - 1) * ADMIN_LIST_PER_PAGE;

  const comments = await getAdminComments({
    postId,
    limit: ADMIN_LIST_PER_PAGE,
    offset,
  });

  const activePost = postId
    ? posts.find((post) => post.id === postId) ?? null
    : null;

  return {
    comments,
    posts,
    filterPostId: postId ?? null,
    activePost,
    page: meta.page,
    totalPages: meta.totalPages,
    totalItems: meta.totalItems,
    perPage: meta.perPage,
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