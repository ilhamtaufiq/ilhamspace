import { fail } from "@sveltejs/kit";

import { deletePost, getAllPosts } from "$lib/server/posts";
import {
  importWordPressExportXml,
  readWordPressExportFile,
} from "$lib/server/wordpress/import";
import { parseWordPressExport } from "$lib/server/wordpress/parse-export";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = await getAllPosts();
  return { posts };
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

    await deletePost(id);
    return { success: true };
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