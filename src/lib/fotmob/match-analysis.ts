import { mapMatchStats } from "$lib/fotmob/match-stats";
import { getRoundLabel } from "$lib/fotmob/world-cup";
import type {
  MatchDetailView,
  MatchEventView,
  MatchH2HRecord,
  MatchLineupPlayer,
  MatchLineupView,
  MatchMomentumPoint,
  MatchPlayerRating,
  MatchShotView,
  MatchStatRow,
  MatchTeamView,
} from "$lib/fotmob/types";

type Locale = "id" | "en";

type StatEntry = {
  title?: string;
  key?: string;
  stats?: Array<number | string | null>;
};

type StatGroup = {
  title?: string;
  stats?: StatEntry[];
};

type GoalEvent = {
  timeStr?: number;
  time?: number;
  type?: string;
  isHome?: boolean;
  nameStr?: string;
  player?: { name?: string };
  assistStr?: string;
  newScore?: [number, number];
  cardDescription?: string;
};

type PitchLayoutRaw = {
  x?: number;
  y?: number;
};

type LineupPlayerRaw = {
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  shirtNumber?: string;
  performance?: { rating?: number };
  verticalLayout?: PitchLayoutRaw;
};

type LineupSide = {
  name?: string;
  id?: number;
  formation?: string;
  starters?: LineupPlayerRaw[];
  subs?: LineupPlayerRaw[];
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

const formatStatDisplay = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  return String(value);
};

const findStatGroup = (
  groups: StatGroup[] | undefined,
  title: string,
): StatGroup | undefined => groups?.find((group) => group.title === title);

const STAT_LABELS: Record<string, { id: string; en: string }> = {
  "Ball possession": { id: "Penguasaan bola", en: "Ball possession" },
  "Expected goals (xG)": { id: "Expected goals (xG)", en: "Expected goals (xG)" },
  "Total shots": { id: "Total tembakan", en: "Total shots" },
  "Shots on target": { id: "Tembakan tepat sasaran", en: "Shots on target" },
  "Touches in opposition box": {
    id: "Sentuhan di kotak penalti lawan",
    en: "Touches in opposition box",
  },
  "Accurate passes": { id: "Umpan akurat", en: "Accurate passes" },
};

const extractKeyStats = (
  groups: StatGroup[] | undefined,
  locale: Locale,
): MatchStatRow[] => {
  const top = findStatGroup(groups, "Top stats");
  const keys = Object.keys(STAT_LABELS);

  const rows: MatchStatRow[] = [];
  for (const label of keys) {
    const entry = top?.stats?.find((item) => item.title === label);
    if (!entry?.stats || entry.stats[0] === null) {
      continue;
    }
    const home = entry.stats[0];
    const away = entry.stats[1];
    rows.push({
      key: entry.key ?? label,
      label: locale === "id" ? STAT_LABELS[label].id : STAT_LABELS[label].en,
      home: formatStatDisplay(home),
      away: formatStatDisplay(away),
      homeNum: parseStatNumber(home),
      awayNum: parseStatNumber(away),
    });
  }
  return rows;
};

const flattenGoals = (
  goalsByPlayer: Record<string, GoalEvent[]> | undefined,
  team: "home" | "away",
): MatchEventView[] => {
  if (!goalsByPlayer) {
    return [];
  }
  const events: MatchEventView[] = [];
  for (const playerGoals of Object.values(goalsByPlayer)) {
    for (const goal of playerGoals) {
      const minute = goal.timeStr ?? goal.time ?? 0;
      const scoreAfter = goal.newScore
        ? `${goal.newScore[0]} - ${goal.newScore[1]}`
        : undefined;
      events.push({
        id: `${team}-goal-${minute}-${goal.player?.name ?? goal.nameStr}`,
        minute,
        type: "goal",
        team,
        playerName: goal.nameStr ?? goal.player?.name ?? "—",
        detail: goal.assistStr,
        scoreAfter,
      });
    }
  }
  return events;
};

const flattenCards = (
  cardsByPlayer: Record<string, GoalEvent[]> | undefined,
  team: "home" | "away",
): MatchEventView[] => {
  if (!cardsByPlayer) {
    return [];
  }
  const events: MatchEventView[] = [];
  for (const playerCards of Object.values(cardsByPlayer)) {
    for (const card of playerCards) {
      events.push({
        id: `${team}-card-${card.timeStr}-${card.nameStr}`,
        minute: card.timeStr ?? card.time ?? 0,
        type: "card",
        team,
        playerName: card.nameStr ?? card.player?.name ?? "—",
        detail: card.cardDescription,
      });
    }
  }
  return events;
};

const mapPitchPosition = (
  layout: PitchLayoutRaw | undefined,
  teamSide: "home" | "away",
): { pitchX: number; pitchY: number } => {
  const x = (layout?.x ?? 0.5) * 100;
  const rawY = layout?.y ?? 0.5;
  const halfY = rawY * 45 + 2.5;
  const pitchY = teamSide === "home" ? halfY : 100 - halfY;
  return { pitchX: x, pitchY };
};

const playerShortName = (player: LineupPlayerRaw): string => {
  if (player.lastName) {
    return player.lastName;
  }
  const parts = (player.name ?? "").trim().split(/\s+/);
  return parts[parts.length - 1] || player.name || "—";
};

const mapLineupSide = (
  side: LineupSide | undefined,
  teamSide: "home" | "away",
  teamColor?: string,
): MatchLineupView | undefined => {
  if (!side?.id || !side.name) {
    return undefined;
  }
  const mapPlayer = (player: LineupPlayerRaw): MatchLineupPlayer => {
    const pitch = mapPitchPosition(player.verticalLayout, teamSide);
    return {
      id: player.id ?? 0,
      name: player.name ?? "—",
      shortName: playerShortName(player),
      shirtNumber: player.shirtNumber ?? "—",
      rating: player.performance?.rating,
      pitchX: pitch.pitchX,
      pitchY: pitch.pitchY,
    };
  };

  return {
    teamId: side.id,
    teamName: side.name,
    formation: side.formation ?? "—",
    teamColor,
    starters: (side.starters ?? []).map(mapPlayer),
    subs: (side.subs ?? []).map(mapPlayer),
  };
};

const getPlayerStatValue = (
  player: Record<string, unknown>,
  statKey: string,
): number => {
  const groups = player.stats as Array<{
    stats?: Record<string, { key?: string; stat?: { value?: number | string } }>;
  }> | undefined;

  for (const group of groups ?? []) {
    for (const entry of Object.values(group.stats ?? {})) {
      if (entry?.key === statKey && entry.stat?.value !== undefined) {
        return parseStatNumber(entry.stat.value);
      }
    }
  }
  return 0;
};

const mapPlayerRatings = (
  raw: Record<string, unknown> | null,
): MatchPlayerRating[] => {
  if (!raw) {
    return [];
  }
  const players: MatchPlayerRating[] = [];
  for (const entry of Object.values(raw)) {
    const player = entry as Record<string, unknown>;
    const rating = getPlayerStatValue(player, "rating_title");
    const minutes = getPlayerStatValue(player, "minutes_played");
    if (!player.id || !player.name || minutes <= 0) {
      continue;
    }
    players.push({
      id: player.id as number,
      name: player.name as string,
      teamId: player.teamId as number,
      teamName: player.teamName as string,
      shirtNumber: String(player.shirtNumber ?? "—"),
      rating,
      goals: getPlayerStatValue(player, "goals"),
      assists: getPlayerStatValue(player, "assists"),
      xg: getPlayerStatValue(player, "expected_goals"),
      minutes,
    });
  }
  return players
    .filter((player) => player.rating > 0)
    .sort((a, b) => b.rating - a.rating);
};

const mapH2H = (raw: Record<string, unknown> | undefined): MatchH2HRecord | undefined => {
  if (!raw?.summary) {
    return undefined;
  }
  const summary = raw.summary as number[];
  const matches = (raw.matches as Array<Record<string, unknown>>) ?? [];
  return {
    homeWins: summary[0] ?? 0,
    draws: summary[1] ?? 0,
    awayWins: summary[2] ?? 0,
    recent: matches.slice(0, 5).map((match) => {
      const home = match.home as { name?: string; id?: number };
      const away = match.away as { name?: string; id?: number };
      const status = match.status as { scoreStr?: string; utcTime?: string };
      const time = match.time as { utcTime?: string };
      const date = status?.utcTime ?? time?.utcTime ?? "";
      return {
        date,
        homeName: home?.name ?? "—",
        awayName: away?.name ?? "—",
        score: status?.scoreStr ?? "—",
        homeId: home?.id ?? 0,
        awayId: away?.id ?? 0,
      };
    }),
  };
};

const mapMomentum = (raw: Record<string, unknown> | undefined): MatchMomentumPoint[] => {
  const main = raw?.main as { data?: Array<{ minute?: number; value?: number }> };
  return (main?.data ?? []).map((point) => ({
    minute: point.minute ?? 0,
    value: point.value ?? 0,
  }));
};

const mapShots = (raw: Record<string, unknown> | undefined): MatchShotView[] => {
  const shots = (raw?.shots as Array<Record<string, unknown>>) ?? [];
  return shots.map((shot) => ({
    id: shot.id as number,
    teamId: shot.teamId as number,
    playerName: shot.playerName as string,
    x: shot.x as number,
    y: shot.y as number,
    minute: (shot.min as number) ?? 0,
    isGoal: shot.eventType === "Goal",
    isOnTarget: Boolean(shot.isOnTarget),
    xg: parseStatNumber(shot.expectedGoals as number | string),
  }));
};

const buildInsights = (
  locale: Locale,
  home: MatchTeamView,
  away: MatchTeamView,
  stats: MatchStatRow[],
  potm?: MatchDetailView["playerOfMatch"],
  h2h?: MatchH2HRecord,
): string[] => {
  const insights: string[] = [];
  const xg = stats.find((row) => row.key === "expected_goals" || row.label.includes("xG"));
  const possession = stats.find((row) => row.key.includes("possession") || row.label.toLowerCase().includes("possession") || row.label.includes("Penguasaan"));
  const shots = stats.find((row) => row.key === "ShotsOnTarget" || row.label.toLowerCase().includes("target") || row.label.includes("tepat sasaran"));

  if (xg && (xg.homeNum > 0 || xg.awayNum > 0)) {
    const leader =
      xg.homeNum >= xg.awayNum
        ? { name: home.name, xg: xg.homeNum, other: xg.awayNum }
        : { name: away.name, xg: xg.awayNum, other: xg.homeNum };
    const diff = Math.abs(xg.homeNum - xg.awayNum);
    if (locale === "id") {
      insights.push(
        diff >= 0.5
          ? `${leader.name} unggul xG ${leader.xg.toFixed(2)} vs ${leader.other.toFixed(2)} — dominasi peluang yang jelas.`
          : `xG ketat: ${home.name} ${xg.home} vs ${away.name} ${xg.away}.`,
      );
    } else {
      insights.push(
        diff >= 0.5
          ? `${leader.name} led xG ${leader.xg.toFixed(2)} vs ${leader.other.toFixed(2)} — clear chance dominance.`
          : `Tight xG battle: ${home.name} ${xg.home} vs ${away.name} ${xg.away}.`,
      );
    }
  }

  if (possession) {
    const leader =
      possession.homeNum >= possession.awayNum ? home.name : away.name;
    const pct = Math.max(possession.homeNum, possession.awayNum);
    insights.push(
      locale === "id"
        ? `${leader} menguasai bola ${pct.toFixed(0)}% penguasaan.`
        : `${leader} controlled possession at ${pct.toFixed(0)}%.`,
    );
  }

  if (shots) {
    insights.push(
      locale === "id"
        ? `Temuan tepat sasaran: ${home.name} ${shots.home} — ${away.name} ${shots.away}.`
        : `Shots on target: ${home.name} ${shots.home} — ${away.name} ${shots.away}.`,
    );
  }

  if (potm) {
    insights.push(
      locale === "id"
        ? `Pemain terbaik: ${potm.name} (${potm.rating}) — ${potm.teamName}.`
        : `Player of the match: ${potm.name} (${potm.rating}) — ${potm.teamName}.`,
    );
  }

  if (h2h) {
    insights.push(
      locale === "id"
        ? `Head-to-head: ${home.name} ${h2h.homeWins}W ${h2h.draws}D ${h2h.awayWins}L vs ${away.name}.`
        : `Head-to-head: ${home.name} ${h2h.homeWins}W ${h2h.draws}D ${h2h.awayWins}L vs ${away.name}.`,
    );
  }

  return insights.slice(0, 5);
};

const formatKickoff = (utc: string | undefined, locale: Locale): string => {
  if (!utc) {
    return "—";
  }
  const date = new Date(utc);
  return date.toLocaleString(locale === "id" ? "id-ID" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type LiveTimeStatus = {
  short?: string;
  addedTime?: number;
};

const normalizeMinuteLabel = (value: string): string =>
  value.replace(/[\u200e\u200f]/g, "").trim();

const extractMatchMinute = (
  status: Record<string, unknown>,
  isLive: boolean,
  isFinished: boolean,
  statusShort: string,
): string => {
  if (isFinished) {
    return statusShort || "FT";
  }

  if (!isLive) {
    return "";
  }

  const liveTime = status.liveTime as LiveTimeStatus | undefined;
  const short = liveTime?.short ? normalizeMinuteLabel(liveTime.short) : "";
  if (!short) {
    return "";
  }

  const added = liveTime?.addedTime ?? 0;
  const minuteMatch = short.match(/^(\d+)/);
  if (added > 0 && minuteMatch) {
    return `${minuteMatch[1]}+${added}'`;
  }

  return short;
};

export const mapMatchDetail = (
  details: Record<string, unknown>,
  playerStats: Record<string, unknown> | null,
  locale: Locale,
): MatchDetailView => {
  const general = details.general as Record<string, unknown>;
  const header = details.header as Record<string, unknown>;
  const content = details.content as Record<string, unknown>;
  const teams = (header?.teams as Array<Record<string, unknown>>) ?? [];
  const status = header?.status as Record<string, unknown>;
  const events = header?.events as Record<string, unknown>;
  const reason = status?.reason as { short?: string; long?: string };

  const homeHeader = teams[0] ?? {};
  const awayHeader = teams[1] ?? {};

  const home: MatchTeamView = {
    id: (general?.homeTeam as { id?: number })?.id ?? (homeHeader.id as number),
    name:
      (general?.homeTeam as { name?: string })?.name ??
      (homeHeader.name as string) ??
      "Home",
    score: (homeHeader.score as number) ?? 0,
    fifaRank: homeHeader.fifaRank as number | undefined,
  };

  const away: MatchTeamView = {
    id: (general?.awayTeam as { id?: number })?.id ?? (awayHeader.id as number),
    name:
      (general?.awayTeam as { name?: string })?.name ??
      (awayHeader.name as string) ??
      "Away",
    score: (awayHeader.score as number) ?? 0,
    fifaRank: awayHeader.fifaRank as number | undefined,
  };

  const round = (general?.leagueRoundName as string) ?? "";
  const statPeriods = content?.stats as { Periods?: { All?: { stats?: StatGroup[] } } };
  const statGroups = statPeriods?.Periods?.All?.stats;
  const stats = extractKeyStats(statGroups, locale);
  const matchStats = mapMatchStats(details, locale);

  const matchEvents = [
    ...flattenGoals(events?.homeTeamGoals as Record<string, GoalEvent[]>, "home"),
    ...flattenGoals(events?.awayTeamGoals as Record<string, GoalEvent[]>, "away"),
    ...flattenCards(events?.homeTeamRedCards as Record<string, GoalEvent[]>, "home"),
    ...flattenCards(events?.awayTeamRedCards as Record<string, GoalEvent[]>, "away"),
  ].sort((a, b) => a.minute - b.minute);

  const matchFacts = content?.matchFacts as Record<string, unknown>;
  const potmRaw = matchFacts?.playerOfTheMatch as Record<string, unknown>;
  const potmName = potmRaw?.name as { fullName?: string } | undefined;
  const potmRating = potmRaw?.rating as { num?: string } | undefined;
  const playerOfMatch =
    potmRaw?.id && potmName?.fullName
      ? {
          id: potmRaw.id as number,
          name: potmName.fullName,
          teamName: (potmRaw.teamName as string) ?? "",
          rating: Number.parseFloat(potmRating?.num ?? "0"),
        }
      : undefined;

  const lineup = content?.lineup as {
    homeTeam?: LineupSide;
    awayTeam?: LineupSide;
  };
  const teamColors = general?.teamColors as {
    lightMode?: { home?: string; away?: string };
  } | undefined;
  const h2h = mapH2H(content?.h2h as Record<string, unknown>);
  const topPlayers = mapPlayerRatings(playerStats);
  const momentum = mapMomentum(content?.momentum as Record<string, unknown>);
  const shots = mapShots(content?.shotmap as Record<string, unknown>);

  const kickoffUtc =
    (general?.matchTimeUTCDate as string) ?? (status?.utcTime as string);
  const isLive = status?.started === true && status?.finished !== true;
  const isFinished = status?.finished === true;
  const statusShort = reason?.short ?? "";

  return {
    matchId: Number(general?.matchId ?? 0),
    round,
    roundLabel: getRoundLabel(round, locale),
    kickoff: kickoffUtc ?? "",
    kickoffLabel: formatKickoff(kickoffUtc, locale),
    statusShort,
    statusLong: reason?.long ?? "",
    matchMinute: extractMatchMinute(
      status ?? {},
      isLive,
      isFinished,
      statusShort,
    ),
    isLive,
    isFinished,
    home,
    away,
    stats,
    matchStats,
    events: matchEvents,
    insights: buildInsights(locale, home, away, stats, playerOfMatch, h2h),
    playerOfMatch,
    homeLineup: mapLineupSide(
      lineup?.homeTeam,
      "home",
      teamColors?.lightMode?.home,
    ),
    awayLineup: mapLineupSide(
      lineup?.awayTeam,
      "away",
      teamColors?.lightMode?.away,
    ),
    topPlayers,
    h2h,
    momentum,
    shots,
  };
};