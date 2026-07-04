import {
  getUmamiSettings,
  isUmamiStatsConfigured,
} from "$lib/db/umami-settings";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  views: number;
  expiresAt: number;
};

const viewCache = new Map<string, CacheEntry>();

export const normalizeUmamiPath = (path: string): string => {
  const trimmed = path.trim();
  if (!trimmed) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const getCachedViews = (path: string): number | null => {
  const entry = viewCache.get(path);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    viewCache.delete(path);
    return null;
  }

  return entry.views;
};

const setCachedViews = (path: string, views: number): void => {
  viewCache.set(path, {
    views,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
};

type UmamiStatsResponse = {
  pageviews?: { value?: number } | number;
};

const parsePageviews = (payload: UmamiStatsResponse): number => {
  const pageviews = payload.pageviews;
  if (typeof pageviews === "number") {
    return pageviews;
  }

  if (pageviews && typeof pageviews.value === "number") {
    return pageviews.value;
  }

  return 0;
};

export const fetchUmamiPageViews = async (rawPath: string): Promise<number | null> => {
  const path = normalizeUmamiPath(rawPath);
  const cached = getCachedViews(path);
  if (cached !== null) {
    return cached;
  }

  const settings = await getUmamiSettings();
  if (!isUmamiStatsConfigured(settings)) {
    return null;
  }

  const apiBase = settings!.apiUrl!.replace(/\/$/, "");
  const statsUrl = new URL(`/api/websites/${settings!.websiteId}/stats`, apiBase);
  statsUrl.searchParams.set("startAt", "0");
  statsUrl.searchParams.set("endAt", String(Date.now()));
  statsUrl.searchParams.set("url", path);

  try {
    const response = await fetch(statsUrl, {
      headers: {
        Authorization: `Bearer ${settings!.apiToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("[umami] stats error:", response.status, path);
      return null;
    }

    const payload = (await response.json()) as UmamiStatsResponse;
    const views = parsePageviews(payload);
    setCachedViews(path, views);
    return views;
  } catch (error) {
    console.error("[umami] stats fetch failed:", error);
    return null;
  }
};

export const fetchUmamiPageViewsBatch = async (
  rawPaths: string[],
): Promise<Record<string, number | null>> => {
  const uniquePaths = [...new Set(rawPaths.map(normalizeUmamiPath))];
  const entries = await Promise.all(
    uniquePaths.map(async (path) => [path, await fetchUmamiPageViews(path)] as const),
  );

  return Object.fromEntries(entries);
};

export const clearUmamiViewCache = (): void => {
  viewCache.clear();
};

export const testUmamiConnection = async (): Promise<
  { ok: true } | { ok: false; message: string }
> => {
  const views = await fetchUmamiPageViews("/");
  if (views === null) {
    return {
      ok: false,
      message: "Could not reach Umami. Check API URL, token, and website ID.",
    };
  }

  return { ok: true };
};