export const ADMIN_LIST_PER_PAGE = 10;

export type AdminPaginationMeta = {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
};

export const parseAdminPageParam = (searchParams: URLSearchParams): number => {
  const pageRaw = searchParams.get("page");
  const parsedPage = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
};

export const clampAdminPage = (page: number, totalPages: number): number =>
  Math.min(Math.max(1, page), Math.max(1, totalPages));

export const buildAdminListUrl = (
  path: string,
  query: { page?: number; post?: string | null },
): string => {
  const params = new URLSearchParams();

  if (query.post) {
    params.set("post", query.post);
  }

  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  const search = params.toString();
  return search ? `${path}?${search}` : path;
};

export const buildAdminPaginationMeta = (
  totalItems: number,
  page: number,
  perPage: number = ADMIN_LIST_PER_PAGE,
): AdminPaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = clampAdminPage(page, totalPages);

  return {
    page: safePage,
    totalPages,
    totalItems,
    perPage,
  };
};