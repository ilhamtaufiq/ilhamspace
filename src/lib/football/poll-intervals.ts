/** Live score, minute, stats — keep tight so the clock resyncs often. */
export const LIVE_MATCH_POLL_MS = 5_000;

/** Play-by-play cards and pitch actions. */
export const PLAY_BY_PLAY_POLL_MS = 10_000;

/** Live commentary ticker. */
export const COMMENTARY_POLL_MS = 15_000;

export const livePollFetchInit: RequestInit = { cache: "no-store" };