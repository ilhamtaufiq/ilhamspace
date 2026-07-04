import type {
  MatchStatGroup,
  MatchStatPeriod,
  MatchStatPeriodKey,
  MatchStatRow,
  MatchStatsView,
} from "$lib/fotmob/types";

type Locale = "id" | "en";

type StatEntryRaw = {
  title?: string;
  key?: string;
  stats?: Array<number | string | null>;
  format?: string;
  type?: string;
  highlighted?: "home" | "away" | "equal";
};

type StatGroupRaw = {
  title?: string;
  key?: string;
  stats?: StatEntryRaw[];
};

type StatPeriodsRaw = {
  Periods?: Partial<Record<MatchStatPeriodKey, { stats?: StatGroupRaw[] }>>;
};

const PERIOD_ORDER: MatchStatPeriodKey[] = [
  "All",
  "FirstHalf",
  "SecondHalf",
];

const PERIOD_LABELS: Record<MatchStatPeriodKey, { id: string; en: string }> = {
  All: { id: "Seluruh pertandingan", en: "Full match" },
  FirstHalf: { id: "Babak 1", en: "1st half" },
  SecondHalf: { id: "Babak 2", en: "2nd half" },
};

const GROUP_LABELS: Record<string, { id: string; en: string }> = {
  top_stats: { id: "Stat utama", en: "Top stats" },
  shots: { id: "Tembakan", en: "Shots" },
  expected_goals: { id: "xG", en: "xG" },
  passes: { id: "Umpan", en: "Passes" },
  defence: { id: "Pertahanan", en: "Defence" },
  duels: { id: "Duel", en: "Duels" },
  discipline: { id: "Disiplin", en: "Discipline" },
};

const STAT_LABELS_ID: Record<string, string> = {
  BallPossesion: "Penguasaan bola",
  expected_goals: "Expected goals (xG)",
  total_shots: "Total tembakan",
  ShotsOnTarget: "Tembakan tepat sasaran",
  ShotsOffTarget: "Tembakan meleset",
  touches_opp_box: "Sentuhan di kotak penalti lawan",
  big_chance: "Peluang besar",
  big_chance_missed_title: "Peluang besar gagal",
  accurate_passes: "Umpan akurat",
  yellow_cards: "Kartu kuning",
  red_cards: "Kartu merah",
  corners: "Tendangan sudut",
  blocked_shots: "Tembakan diblok",
  shots_woodwork: "Kena tiang",
  shots_inside_box: "Tembakan di dalam kotak",
  shots_outside_box: "Tembakan di luar kotak",
  expected_goals_open_play: "xG open play",
  expected_goals_set_play: "xG set play",
  expected_goals_non_penalty: "xG non-penalty",
  expected_goals_on_target: "xG on target (xGOT)",
  passes: "Umpan",
  own_half_passes: "Umpan di area sendiri",
  opposition_half_passes: "Umpan di area lawan",
  long_balls_accurate: "Umpan panjang akurat",
  accurate_crosses: "Silang akurat",
  player_throws: "Lemparan ke dalam",
  Offsides: "Offside",
  "matchstats.headers.tackles": "Tackle",
  interceptions: "Intersep",
  shot_blocks: "Blok",
  clearances: "Clearance",
  keeper_saves: "Penyelamatan kiper",
  duel_won: "Duel dimenangkan",
  ground_duels_won: "Duel darat dimenangkan",
  aerials_won: "Duel udara dimenangkan",
  dribbles_succeeded: "Dribel sukses",
  fouls: "Pelanggaran",
};

const parseStatNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  const match = value.match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : 0;
};

const formatStatDisplay = (
  value: number | string | null | undefined,
): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  return String(value);
};

const statLabel = (
  entry: StatEntryRaw,
  locale: Locale,
): string => {
  const key = entry.key ?? "";
  if (locale === "id" && STAT_LABELS_ID[key]) {
    return STAT_LABELS_ID[key];
  }
  return entry.title ?? key;
};

const groupLabel = (group: StatGroupRaw, locale: Locale): string => {
  const key = group.key ?? "";
  const mapped = GROUP_LABELS[key];
  if (mapped) {
    return locale === "id" ? mapped.id : mapped.en;
  }
  return group.title ?? key;
};

const shouldShowBar = (entry: StatEntryRaw): boolean => {
  if (entry.type === "graph") {
    return true;
  }
  const home = entry.stats?.[0];
  const away = entry.stats?.[1];
  if (home === null || home === undefined || away === null || away === undefined) {
    return false;
  }
  if (entry.type === "title") {
    return false;
  }
  return entry.format === "integer" || entry.format === "double";
};

const mapStatRow = (
  entry: StatEntryRaw,
  locale: Locale,
  groupKey: string,
  index: number,
): MatchStatRow | null => {
  if (entry.type === "title") {
    return null;
  }

  const home = entry.stats?.[0];
  const away = entry.stats?.[1];
  if (home === null && away === null) {
    return null;
  }
  if (home === undefined && away === undefined) {
    return null;
  }

  const statKey = entry.key ?? entry.title ?? "stat";

  return {
    key: `${groupKey}-${statKey}-${index}`,
    label: statLabel(entry, locale),
    home: formatStatDisplay(home),
    away: formatStatDisplay(away),
    homeNum: parseStatNumber(home),
    awayNum: parseStatNumber(away),
    showBar: shouldShowBar(entry),
    highlighted: entry.highlighted,
  };
};

const mapStatGroup = (group: StatGroupRaw, locale: Locale): MatchStatGroup => {
  const groupKey = group.key ?? group.title ?? "group";
  const rows: MatchStatRow[] = [];
  for (const [index, entry] of (group.stats ?? []).entries()) {
    const row = mapStatRow(entry, locale, groupKey, index);
    if (row) {
      rows.push(row);
    }
  }

  return {
    key: groupKey,
    title: groupLabel(group, locale),
    rows,
  };
};

const mapStatPeriod = (
  key: MatchStatPeriodKey,
  raw: { stats?: StatGroupRaw[] } | undefined,
  locale: Locale,
): MatchStatPeriod | null => {
  const groups = (raw?.stats ?? [])
    .map((group) => mapStatGroup(group, locale))
    .filter((group) => group.rows.length > 0);

  if (groups.length === 0) {
    return null;
  }

  const labels = PERIOD_LABELS[key];
  return {
    key,
    label: locale === "id" ? labels.id : labels.en,
    groups,
  };
};

export const mapMatchStats = (
  details: Record<string, unknown>,
  locale: Locale,
): MatchStatsView => {
  const content = details.content as Record<string, unknown> | undefined;
  const statRoot = content?.stats as StatPeriodsRaw | undefined;
  const periodsRaw = statRoot?.Periods ?? {};

  const periods: MatchStatPeriod[] = [];
  for (const key of PERIOD_ORDER) {
    const period = mapStatPeriod(key, periodsRaw[key], locale);
    if (period) {
      periods.push(period);
    }
  }

  return {
    periods,
    hasData: periods.length > 0,
  };
};