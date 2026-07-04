import type { MatchLiveClock } from "$lib/fotmob/types";

export type LiveClockAnchor = {
  ticking: boolean;
  staticLabel: string;
  baseSeconds: number;
  syncedAt: number;
  injuryBaseMinute?: number;
  injuryAddedMinute?: number;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const parseLiveClockFromLabel = (label: string): MatchLiveClock | undefined => {
  const normalized = label.trim();
  if (!normalized || normalized === "HT") {
    return undefined;
  }

  const injury = normalized.match(/^(\d+)\+(\d+)'?$/);
  if (injury) {
    return {
      minute: Number(injury[1]) + Number(injury[2]),
      second: 0,
      injuryBaseMinute: Number(injury[1]),
      injuryAddedMinute: Number(injury[2]),
    };
  }

  const withSeconds = normalized.match(/^(\d+):(\d{1,2})'?$/);
  if (withSeconds) {
    return {
      minute: Number(withSeconds[1]),
      second: Number(withSeconds[2]),
    };
  }

  const minuteOnly = normalized.match(/^(\d+)'?$/);
  if (minuteOnly) {
    return {
      minute: Number(minuteOnly[1]),
      second: 0,
    };
  }

  return undefined;
};

const injuryKey = (anchor: LiveClockAnchor): string =>
  `${anchor.injuryBaseMinute ?? ""}:${anchor.injuryAddedMinute ?? ""}`;

const mergeLiveClockAnchor = (
  fresh: LiveClockAnchor,
  prev?: LiveClockAnchor,
): LiveClockAnchor => {
  if (!prev?.ticking || !fresh.ticking) {
    return fresh;
  }

  if (injuryKey(prev) !== injuryKey(fresh)) {
    return fresh;
  }

  const tick = Math.floor((Date.now() - prev.syncedAt) / 1000);
  const elapsed = prev.baseSeconds + tick;
  const apiMinute = Math.floor(fresh.baseSeconds / 60);
  const elapsedMinute = Math.floor(elapsed / 60);

  if (elapsedMinute >= apiMinute) {
    return {
      ...fresh,
      baseSeconds: elapsed,
      syncedAt: Date.now(),
    };
  }

  return fresh;
};

export const buildLiveClockAnchor = (
  input: {
    matchMinute: string;
    liveClock?: MatchLiveClock;
    isLive: boolean;
  },
  prev?: LiveClockAnchor,
): LiveClockAnchor => {
  const label = input.matchMinute.trim();
  const syncedAt = Date.now();

  if (!input.isLive) {
    return {
      ticking: false,
      staticLabel: label,
      baseSeconds: 0,
      syncedAt,
    };
  }

  const liveClock = input.liveClock ?? parseLiveClockFromLabel(label);
  if (!liveClock) {
    return {
      ticking: false,
      staticLabel: label,
      baseSeconds: 0,
      syncedAt,
    };
  }

  const fresh: LiveClockAnchor = {
    ticking: true,
    staticLabel: label,
    baseSeconds: liveClock.minute * 60 + liveClock.second,
    syncedAt,
    injuryBaseMinute: liveClock.injuryBaseMinute,
    injuryAddedMinute: liveClock.injuryAddedMinute,
  };

  return mergeLiveClockAnchor(fresh, prev);
};

export const formatLiveClock = (
  anchor: LiveClockAnchor,
  now = Date.now(),
): string => {
  if (!anchor.ticking) {
    return anchor.staticLabel;
  }

  const tick = Math.floor((now - anchor.syncedAt) / 1000);

  if (
    anchor.injuryBaseMinute !== undefined &&
    anchor.injuryAddedMinute !== undefined
  ) {
    const second = (anchor.baseSeconds % 60) + tick;
    return (
      `${anchor.injuryBaseMinute}+${anchor.injuryAddedMinute}:` +
      `${pad2(second % 60)}`
    );
  }

  const elapsed = anchor.baseSeconds + tick;
  const minute = Math.floor(elapsed / 60);
  const second = elapsed % 60;

  return `${minute}:${pad2(second)}`;
};