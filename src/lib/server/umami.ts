import {
  getUmamiSettings,
  isUmamiStatsConfigured,
} from "$lib/db/umami-settings";

import {
  clearUmamiAuthCache,
  getUmamiAuthToken,
  resolveUmamiApiBase,
} from "$lib/server/umami-auth";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  views: number;
  expiresAt: number;
};

const viewCache = new Map<string, CacheEntry>();

export const deriveUmamiScriptUrl = (apiUrl: string): string => {
  const base = apiUrl.trim().replace(/\/$/, "");
  return `${base}/script.js`;
};

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

const fetchStatsForPath = async (
  apiBase: string,
  websiteId: string,
  token: string,
  path: string,
): Promise<number | null> => {
  const statsUrl = new URL(`/api/websites/${websiteId}/stats`, apiBase);
  statsUrl.searchParams.set("startAt", "0");
  statsUrl.searchParams.set("endAt", String(Date.now()));
  statsUrl.searchParams.set("url", path);

  const response = await fetch(statsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error("[umami] stats error:", response.status, path);
    return null;
  }

  const payload = (await response.json()) as UmamiStatsResponse;
  return parsePageviews(payload);
};

export const fetchUmamiPageViews = async (
  rawPath: string,
): Promise<number | null> => {
  const path = normalizeUmamiPath(rawPath);
  const cached = getCachedViews(path);
  if (cached !== null) {
    return cached;
  }

  const settings = await getUmamiSettings();
  if (!isUmamiStatsConfigured(settings)) {
    return null;
  }

  const token = await getUmamiAuthToken(settings!);
  if (!token) {
    return null;
  }

  const apiBase = resolveUmamiApiBase(settings!);
  if (!apiBase || !settings!.websiteId) {
    return null;
  }

  try {
    const views = await fetchStatsForPath(
      apiBase,
      settings!.websiteId,
      token,
      path,
    );

    if (views === null) {
      return null;
    }

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
  clearUmamiAuthCache();
};

export const testUmamiConnection = async (): Promise<
  { ok: true; views: number } | { ok: false; message: string }
> => {
  const views = await fetchUmamiPageViews("/");
  if (views === null) {
    return {
      ok: false,
      message:
        "Could not fetch stats. Add API token or Umami login (username + password).",
    };
  }

  return { ok: true, views };
};