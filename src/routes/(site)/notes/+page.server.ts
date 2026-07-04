import { getCommentCountsByPostIds } from "$lib/db/comments";
import { getPublishedPosts } from "$lib/db/posts";
import { formatPostListItem } from "$lib/posts/format";
import {
  getYearsFromItems,
  groupPostsByYear,
  NOTES_PER_PAGE,
  paginateNotes,
  parseNotesListQuery,
} from "$lib/posts/notes-list";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const posts = await getPublishedPosts();
  const allItems = posts.map((post) => formatPostListItem(post, locals.locale));
  const allYears = getYearsFromItems(allItems);

  const { year: filterYear, page: requestedPage } = parseNotesListQuery(
    url.searchParams,
    allYears,
  );

  const filteredItems = filterYear
    ? allItems.filter((item) => item.year === filterYear)
    : allItems;

  const pagination = paginateNotes(filteredItems, requestedPage, NOTES_PER_PAGE);
  const postsByYear = groupPostsByYear(pagination.items);
  const yearsOnPage = getYearsFromItems(pagination.items);

  const commentCounts = await getCommentCountsByPostIds(
    pagination.items.map((post) => post.id),
  );

  return {
    allYears,
    filterYear,
    years: yearsOnPage,
    postsByYear,
    commentCounts,
    page: pagination.page,
    totalPages: pagination.totalPages,
    totalPosts: pagination.totalItems,
    perPage: NOTES_PER_PAGE,
  };
};