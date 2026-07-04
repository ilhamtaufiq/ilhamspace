import {
  LIVE_MATCH_POLL_MS,
  livePollFetchInit,
} from "$lib/football/poll-intervals";
import type { MatchDetailView, MatchPlayByPlayView } from "$lib/fotmob/types";

export type MatchLiveSnapshot = {
  match: MatchDetailView;
  matchFacts: MatchPlayByPlayView;
};

export { LIVE_MATCH_POLL_MS };

export const fetchMatchLiveSnapshot = async (
  matchId: number,
): Promise<MatchLiveSnapshot | null> => {
  try {
    const response = await fetch(
      `/api/football/matches/${matchId}/live`,
      livePollFetchInit,
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as MatchLiveSnapshot;
  } catch {
    return null;
  }
};

export const startMatchLivePolling = (
  matchId: number,
  onUpdate: (snapshot: MatchLiveSnapshot) => void,
  options?: { intervalMs?: number },
): (() => void) => {
  const intervalMs = options?.intervalMs ?? LIVE_MATCH_POLL_MS;
  let stopped = false;

  const stop = (): void => {
    stopped = true;
    clearInterval(timer);
  };

  const poll = async (): Promise<void> => {
    if (stopped) {
      return;
    }

    const snapshot = await fetchMatchLiveSnapshot(matchId);
    if (!snapshot) {
      return;
    }

    onUpdate(snapshot);

    if (snapshot.match.isFinished) {
      stop();
    }
  };

  void poll();
  const timer = setInterval(() => {
    void poll();
  }, intervalMs);

  return stop;
};