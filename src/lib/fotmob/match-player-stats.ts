import type {
  MatchPlayerDetail,
  MatchPlayerStatGroup,
  MatchPlayerStatItem,
  MatchPlayerStatsIndex,
} from "$lib/fotmob/types";

type PlayerStatValueRaw = {
  value?: number | string;
  total?: number;
  type?: string;
};

type PlayerStatEntryRaw = {
  key?: string | null;
  stat?: PlayerStatValueRaw;
  hideInPopupCard?: boolean;
};

type PlayerStatGroupRaw = {
  title?: string;
  key?: string;
  stats?: Record<string, PlayerStatEntryRaw>;
};

type PlayerStatsRaw = {
  id?: number;
  name?: string;
  teamId?: number;
  teamName?: string;
  shirtNumber?: string | number;
  isGoalkeeper?: boolean;
  stats?: PlayerStatGroupRaw[];
};

const formatStatValue = (stat: PlayerStatValueRaw | undefined): string | null => {
  if (!stat || stat.type === "boolean") {
    return null;
  }
  if (stat.value === undefined || stat.value === null) {
    return null;
  }

  if (stat.type === "fractionWithPercentage" && stat.total !== undefined) {
    const value = Number(stat.value);
    const total = Number(stat.total);
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return `${value}/${total} (${pct}%)`;
  }

  if (typeof stat.value === "number") {
    if (stat.type === "double") {
      return stat.value.toFixed(2).replace(/\.?0+$/, "");
    }
    return String(stat.value);
  }

  return String(stat.value);
};

const mapStatGroup = (group: PlayerStatGroupRaw): MatchPlayerStatGroup | null => {
  const items: MatchPlayerStatItem[] = [];

  for (const [label, entry] of Object.entries(group.stats ?? {})) {
    if (!entry || entry.hideInPopupCard || !entry.key) {
      continue;
    }

    const value = formatStatValue(entry.stat);
    if (!value) {
      continue;
    }

    items.push({
      key: entry.key,
      label,
      value,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return {
    key: group.key ?? group.title ?? "stats",
    title: group.title ?? "Stats",
    items,
  };
};

const mapPlayerDetail = (raw: PlayerStatsRaw): MatchPlayerDetail | null => {
  if (!raw.id || !raw.name) {
    return null;
  }

  const groups = (raw.stats ?? [])
    .map(mapStatGroup)
    .filter((group): group is MatchPlayerStatGroup => group !== null);

  return {
    id: raw.id,
    name: raw.name,
    teamId: raw.teamId ?? 0,
    teamName: raw.teamName ?? "—",
    shirtNumber: String(raw.shirtNumber ?? "—"),
    isGoalkeeper: raw.isGoalkeeper,
    groups,
    hasStats: groups.length > 0,
  };
};

export const mapPlayerStatsIndex = (
  raw: Record<string, unknown> | null,
): MatchPlayerStatsIndex => {
  if (!raw) {
    return {};
  }

  const index: MatchPlayerStatsIndex = {};

  for (const entry of Object.values(raw)) {
    const player = mapPlayerDetail(entry as PlayerStatsRaw);
    if (player) {
      index[player.id] = player;
    }
  }

  return index;
};

export const getPlayerRating = (player: MatchPlayerDetail): number | null => {
  for (const group of player.groups) {
    for (const item of group.items) {
      if (item.key === "rating_title") {
        const rating = Number.parseFloat(item.value);
        return Number.isFinite(rating) ? rating : null;
      }
    }
  }
  return null;
};