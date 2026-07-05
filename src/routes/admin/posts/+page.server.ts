import { fail, redirect } from "@sveltejs/kit";

import { parseAdminPageParam } from "$lib/admin/pagination";
import {
  deletePost,
  getAdminPostsPage,
  getPostStatusCounts,
} from "$lib/server/posts";
import {
  importWordPressExportXml,
  readWordPressExportFile,
} from "$lib/server/wordpress/import";
import { parseWordPressExport } from "$lib/server/wordpress/parse-export";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const requestedPage = parseAdminPageParam(url.searchParams);
  const [result, statusCounts] = await Promise.all([
    getAdminPostsPage(requestedPage),
    getPostStatusCounts(),
  ]);

  return {
    posts: result.posts,
    page: result.page,
    totalPages: result.totalPages,
    totalItems: result.totalItems,
    perPage: result.perPage,
    publishedCount: statusCounts.published,
    draftCount: statusCounts.draft,
  };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    if (!locals.user?.isAdmin) {
      return fail(401, { deleteError: "Unauthorized." });
    }

    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");

    if (!id) {
      return { success: false };
    }

    const deleted = await deletePost(id);
    if (!deleted) {
      return fail(500, { deleteError: "Could not delete post." });
    }

    throw redirect(303, "/admin/posts");
  },

  importWordPress: async ({ request, locals }) => {
    if (!locals.user?.isAdmin) {
      return fail(401, { importError: "Unauthorized." });
    }

    const formData = await request.formData();
    const file = formData.get("export");

    if (!(file instanceof File)) {
      return fail(400, { importError: "Choose a WordPress export file." });
    }

    const xmlOrError = await readWordPressExportFile(file);
    if (typeof xmlOrError !== "string") {
      return fail(400, { importError: xmlOrError.error });
    }

    const parsed = parseWordPressExport(xmlOrError);
    if (parsed.posts.length === 0) {
      return fail(400, {
        importError: "No importable posts found in this export.",
      });
    }

    const importResult = await importWordPressExportXml(xmlOrError);
    return { importResult };
  },
};