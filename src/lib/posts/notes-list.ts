import type { NoteListItem } from "$lib/posts/format";

export const NOTES_PER_PAGE = 10;

export type NotesListQuery = {
  year: number | null;
  page: number;
};

export const parseNotesListQuery = (
  searchParams: URLSearchParams,
  availableYears: number[],
): NotesListQuery => {
  const yearRaw = searchParams.get("year");
  const parsedYear = yearRaw ? Number.parseInt(yearRaw, 10) : Number.NaN;
  const year =
    Number.isFinite(parsedYear) && availableYears.includes(parsedYear)
      ? parsedYear
      : null;

  const pageRaw = searchParams.get("page");
  const parsedPage = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return { year, page };
};

export const groupPostsByYear = (
  items: NoteListItem[],
): Record<number, NoteListItem[]> => {
  return items.reduce<Record<number, NoteListItem[]>>((groups, post) => {
    if (!groups[post.year]) {
      groups[post.year] = [];
    }
    groups[post.year].push(post);
    return groups;
  }, {});
};

export const getYearsFromItems = (items: NoteListItem[]): number[] =>
  [...new Set(items.map((item) => item.year))].sort((a, b) => b - a);

export const buildNotesListUrl = (query: {
  year?: number | null;
  page?: number;
}): string => {
  const params = new URLSearchParams();

  if (query.year) {
    params.set("year", String(query.year));
  }

  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  const search = params.toString();
  return search ? `/notes?${search}` : "/notes";
};

export const paginateNotes = (
  items: NoteListItem[],
  page: number,
  perPage: number = NOTES_PER_PAGE,
): {
  items: NoteListItem[];
  page: number;
  totalPages: number;
  totalItems: number;
} => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * perPage;

  return {
    items: items.slice(offset, offset + perPage),
    page: safePage,
    totalPages,
    totalItems,
  };
};