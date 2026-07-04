import { slugify } from "$lib/editor/slug";
import { isSlugTaken } from "$lib/server/posts";

export const ensureUniqueSlug = async (
  preferred: string,
  excludeId?: string,
): Promise<string> => {
  const base = slugify(preferred) || "post";
  let slug = base;
  let counter = 2;

  while (await isSlugTaken(slug, excludeId)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

export const resolveUniqueSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => ensureUniqueSlug(title, excludeId);