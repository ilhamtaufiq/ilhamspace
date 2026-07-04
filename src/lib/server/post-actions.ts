import { fail, type ActionFailure } from "@sveltejs/kit";

import {
  postFormSchema,
  type PostActionFailure,
  type PostFormInput,
} from "$lib/schemas/post";
import { createPost, updatePost } from "$lib/server/posts";
import { resolveUniqueSlug } from "$lib/server/slug";

const readPostForm = (formData: FormData): PostFormInput => ({
  title: String(formData.get("title") ?? ""),
  description: String(formData.get("description") ?? "") || undefined,
  tags: String(formData.get("tags") ?? "") || undefined,
  status: String(formData.get("status") ?? "draft") as PostFormInput["status"],
  contentJson: String(formData.get("contentJson") ?? ""),
});

const failPost = (
  status: 400 | 500,
  payload: PostActionFailure,
): ActionFailure<PostActionFailure> => fail(status, payload);

export const parsePostForm = (formData: FormData) => {
  return postFormSchema.safeParse(readPostForm(formData));
};

export const handleCreatePost = async (
  formData: FormData,
): Promise<{ success: true; id: string } | ActionFailure<PostActionFailure>> => {
  const raw = readPostForm(formData);
  const parsed = postFormSchema.safeParse(raw);
  if (!parsed.success) {
    return failPost(400, {
      error: "Please check all fields.",
      ...raw,
    });
  }

  const slug = await resolveUniqueSlug(parsed.data.title);
  const post = await createPost({ ...parsed.data, slug });
  if (!post) {
    return failPost(500, {
      error: "Failed to create post.",
      ...parsed.data,
    });
  }

  return { success: true, id: post.id };
};

export const handleUpdatePost = async (
  id: string,
  formData: FormData,
): Promise<
  { success: true } | ActionFailure<PostActionFailure>
> => {
  const raw = readPostForm(formData);
  const parsed = postFormSchema.safeParse(raw);
  if (!parsed.success) {
    return failPost(400, {
      error: "Please check all fields.",
      ...raw,
    });
  }

  const slug = await resolveUniqueSlug(parsed.data.title, id);
  const post = await updatePost(id, { ...parsed.data, slug });
  if (!post) {
    return failPost(500, {
      error: "Failed to update post.",
      ...parsed.data,
    });
  }

  return { success: true };
};