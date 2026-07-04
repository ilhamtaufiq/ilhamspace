import { z } from "zod";

export const postStatusSchema = z.enum(["draft", "published"]);

export const postFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  tags: z.string().optional(),
  status: postStatusSchema,
  contentJson: z.string().min(2, "Content is required."),
});

export type PostFormInput = z.infer<typeof postFormSchema>;

export type PostInput = PostFormInput & {
  slug: string;
};

export type PostActionFailure = PostFormInput & { error: string };

export const parseTagsFromJson = (json: string | null): string[] => {
  if (!json) {
    return [];
  }
  try {
    const tags = JSON.parse(json) as string[];
    return tags.filter(Boolean);
  } catch {
    return [];
  }
};

export const formatTagsFromJson = (json: string | null): string => {
  if (!json) {
    return "";
  }
  return parseTagsFromJson(json).join(", ");
};

export const parseTags = (raw: string | undefined): string[] => {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
};