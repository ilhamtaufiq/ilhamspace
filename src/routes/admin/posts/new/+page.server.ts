import { redirect } from "@sveltejs/kit";

import { handleCreatePost } from "$lib/server/post-actions";

import type { Actions } from "./$types";

export const actions: Actions = {
  save: async ({ request }) => {
    const formData = await request.formData();
    const result = await handleCreatePost(formData);

    if ("status" in result) {
      return result;
    }

    throw redirect(303, `/admin/posts/${result.id}/edit`);
  },
};