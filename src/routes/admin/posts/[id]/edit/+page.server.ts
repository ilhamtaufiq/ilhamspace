import { error, redirect } from "@sveltejs/kit";

import { formatTagsFromJson } from "$lib/schemas/post";
import { handleUpdatePost } from "$lib/server/post-actions";
import { deletePost, getPostById } from "$lib/server/posts";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPostById(params.id);
  if (!post) {
    error(404, "Post not found");
  }

  return {
    post: {
      id: post.id,
      title: post.title,
      description: post.description ?? "",
      tags: formatTagsFromJson(post.tags),
      status: post.status,
      contentJson: post.contentJson,
    },
  };
};

export const actions: Actions = {
  save: async ({ request, params }) => {
    const formData = await request.formData();
    const result = await handleUpdatePost(params.id, formData);

    if ("status" in result) {
      return result;
    }

    return { success: true };
  },
  delete: async ({ params }) => {
    await deletePost(params.id);
    throw redirect(303, "/admin/posts");
  },
};