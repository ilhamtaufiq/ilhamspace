import { getPublishedPosts } from "$lib/db/posts";
import { formatPostListItem } from "$lib/posts/format";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = await getPublishedPosts();
  const items = posts.map(formatPostListItem);

  const postsByYear = items.reduce<
    Record<number, ReturnType<typeof formatPostListItem>[]>
  >((groups, post) => {
    if (!groups[post.year]) {
      groups[post.year] = [];
    }
    groups[post.year].push(post);
    return groups;
  }, {});

  const years = Object.keys(postsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return { years, postsByYear };
};