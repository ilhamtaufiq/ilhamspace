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

export const getMatch = async (matchId: number): Promise<Record<string, unknown>> => {
  return fetchFotmob<Record<string, unknown>>(`/matches/${matchId}`);
};

export const getMatchDetails = async (
  matchId: number,
): Promise<Record<string, unknown>> => {
  return fetchFotmob<Record<string, unknown>>(`/matches/${matchId}/details`);
};

export const getMatchPlayerStats = async (
  matchId: number,
): Promise<Record<string, unknown>> => {
  return fetchFotmob<Record<string, unknown>>(
    `/matches/${matchId}/player-stats`,
  );
};

export const fetchFotmobOptional = async <T>(
  path: string,
): Promise<T | null> => {
  try {
    return await fetchFotmob<T>(path);
  } catch {
    return null;
  }
};

export const getMatchComments = async (
  matchId: number,
): Promise<Record<string, unknown> | null> => {
  return fetchFotmobOptional<Record<string, unknown>>(
    `/matches/${matchId}/comments`,
  );
};