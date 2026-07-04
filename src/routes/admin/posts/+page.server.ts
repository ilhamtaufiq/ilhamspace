import { deletePost, getAllPosts } from "$lib/server/posts";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = await getAllPosts();
  return { posts };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");

    if (!id) {
      return { success: false };
    }

    await deletePost(id);
    return { success: true };
  },
};