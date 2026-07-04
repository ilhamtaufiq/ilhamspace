import { slugify } from "$lib/editor/slug";
import { isSlugTaken } from "$lib/server/posts";

export const resolveUniqueSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => {
  const base = slugify(title) || "post";
  let slug = base;
  let counter = 2;

  while (await isSlugTaken(slug, excludeId)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};