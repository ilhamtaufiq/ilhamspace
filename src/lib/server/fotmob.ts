import type { FotmobApiResponse, LeaguePlayoffData } from "$lib/fotmob/types";

const DEFAULT_FOTMOB_API_URL = "http://localhost:8000";

export const getFotmobApiUrl = (): string => {
  const raw = process.env.FOTMOB_API_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : DEFAULT_FOTMOB_API_URL;
};

export const fetchFotmob = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const url = `${getFotmobApiUrl()}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  const body = (await response.json()) as FotmobApiResponse<T>;
  if (!response.ok || body.success !== true || body.data === undefined) {
    throw new Error(body.error ?? `FotMob API error (${response.status})`);
  }

  return body.data;
};

export const getLeaguePlayoff = async (
  leagueId: number,
): Promise<LeaguePlayoffData> => {
  return fetchFotmob<LeaguePlayoffData>(`/leagues/${leagueId}/playoff`);
};