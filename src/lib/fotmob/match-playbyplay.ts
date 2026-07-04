import type {
  MatchCommentaryView,
  MatchPlayByPlayEntry,
  MatchPlayByPlayView,
} from "$lib/fotmob/types";

type FactsPlayer = {
  name?: string;
};

type FactsSwapPlayer = {
  name?: string;
};

type FactsEvent = {
  reactKey?: string;
  timeStr?: number | string;
  type?: string;
  time?: number;
  overloadTime?: number | null;
  eventId?: number;
  isHome?: boolean;
  nameStr?: string;
  player?: FactsPlayer;
  card?: string;
  newScore?: [number, number];
  assistStr?: string;
  goalDescription?: string;
  swap?: FactsSwapPlayer[];
  halfStrShort?: string;
  minutesAddedStr?: string;
  minutesAddedInput?: number;
  shotmapEvent?: { expectedGoals?: number };
};

type FactsEventsBlock = {
  events?: FactsEvent[];
};

const LTC_NARRATIVE_CODES = new Set([
  "comment",
  "team news",
  "post_match summary",
  "highlight",
  "half_time summary",
]);

const LTC_ACTION_CODES = new Set(["G", "AS", "YC", "RC", "SI"]);

type LtcPlayer = {
  Id?: number;
  Name?: string;
  TeamId?: number;
};

type LtcActionEvent = {
  MessageId?: string;
  IncidentCode?: string;
  Elapsed?: number;
  ElapsedPlus?: number;
  Description?: string;
  IncludeInHighlight?: boolean;
  HometeamEvent?: boolean;
  Players?: LtcPlayer[];
  EventId?: number;
};

type LtcActionPayload = {
  Events?: LtcActionEvent[];
  LastUpdated?: string;
};

const formatLtcMinute = (elapsed: number, plus: number): string => {
  if (elapsed <= 0 && plus < 0) {
    return "";
  }
  if (plus > 0) {
    return `${elapsed}+${plus}'`;
  }
  return `${elapsed}'`;
};

const mapLtcActionKind = (
  code: string,
): MatchPlayByPlayEntry["kind"] | null => {
  switch (code) {
    case "G":
      return "goal";
    case "AS":
      return "assist";
    case "YC":
    case "RC":
      return "card";
    case "SI":
      return "substitution";
    default:
      return null;
  }
};

const mapLtcActionEvent = (
  event: LtcActionEvent,
  index: number,
): MatchPlayByPlayEntry | null => {
  const code = event.IncidentCode ?? "";
  if (!LTC_ACTION_CODES.has(code)) {
    return null;
  }

  const kind = mapLtcActionKind(code);
  if (!kind) {
    return null;
  }

  const elapsed = event.Elapsed ?? 0;
  const plus = event.ElapsedPlus ?? -1;
  const sortKey = elapsed * 100 + (plus > 0 ? plus : 0);
  const team =
    event.HometeamEvent === true
      ? "home"
      : event.HometeamEvent === false
        ? "away"
        : undefined;
  const players = event.Players ?? [];
  const primaryPlayer = players[0]?.Name;

  if (kind === "substitution" && players.length >= 2) {
    return {
      id: event.MessageId ?? `ltc-si-${event.EventId ?? index}`,
      kind,
      source: "ltc",
      minute: formatLtcMinute(elapsed, plus > 0 ? plus : -1),
      sortKey,
      team,
      title: "Substitution",
      playerName: players[0]?.Name,
      description: `${players[0]?.Name ?? "—"} → ${players[1]?.Name ?? "—"}`,
      isHighlight: false,
    };
  }

  if (kind === "card") {
    const cardLabel = code === "RC" ? "Red card" : "Yellow card";
    return {
      id: event.MessageId ?? `ltc-card-${event.EventId ?? index}`,
      kind,
      source: "ltc",
      minute: formatLtcMinute(elapsed, plus > 0 ? plus : -1),
      sortKey,
      team,
      playerName: primaryPlayer,
      title: primaryPlayer ?? cardLabel,
      description: cardLabel,
      isHighlight: code === "RC",
    };
  }

  return {
    id: event.MessageId ?? `ltc-${code}-${event.EventId ?? index}`,
    kind,
    source: "ltc",
    minute: formatLtcMinute(elapsed, plus > 0 ? plus : -1),
    sortKey,
    team,
    playerName: primaryPlayer,
    title: primaryPlayer,
    description:
      kind === "assist"
        ? undefined
        : event.Description
          ? event.Description.slice(0, 120)
          : undefined,
    isHighlight: event.IncludeInHighlight === true || kind === "goal",
  };
};

const mapLtcActionEvents = (
  raw: Record<string, unknown> | null | undefined,
): MatchPlayByPlayEntry[] => {
  const payload = raw as LtcActionPayload | null | undefined;
  const events = payload?.Events ?? [];
  const entries: MatchPlayByPlayEntry[] = [];

  for (const [index, event] of events.entries()) {
    const mapped = mapLtcActionEvent(event, index);
    if (mapped) {
      entries.push(mapped);
    }
  }

  return entries;
};

const dedupeActionEntries = (
  entries: MatchPlayByPlayEntry[],
): MatchPlayByPlayEntry[] => {
  const seen = new Set<string>();
  const result: MatchPlayByPlayEntry[] = [];

  for (const entry of entries) {
    const key = `${entry.kind}:${entry.minute}:${entry.playerName ?? entry.title ?? entry.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(entry);
  }

  return result;
};

const parseMinuteParts = (
  time: number,
  overloadTime: number | null | undefined,
): { label: string; sortKey: number } => {
  const plus = overloadTime ?? 0;
  const label = plus > 0 ? `${time}+${plus}'` : time > 0 ? `${time}'` : "";
  const sortKey = time * 100 + plus;
  return { label, sortKey };
};

const formatFactsMinute = (event: FactsEvent): { label: string; sortKey: number } => {
  if (typeof event.timeStr === "string" && event.timeStr.trim()) {
    const match = event.timeStr.match(/(\d+)\s*\+\s*(\d+)/);
    if (match) {
      const base = Number.parseInt(match[1], 10);
      const plus = Number.parseInt(match[2], 10);
      return { label: `${base}+${plus}'`, sortKey: base * 100 + plus };
    }
    const base = Number.parseInt(event.timeStr, 10);
    if (!Number.isNaN(base)) {
      return parseMinuteParts(base, event.overloadTime);
    }
    return { label: event.timeStr, sortKey: 0 };
  }

  return parseMinuteParts(event.time ?? 0, event.overloadTime);
};

const mapFactsKind = (
  type: string,
): MatchPlayByPlayEntry["kind"] => {
  switch (type) {
    case "Goal":
      return "goal";
    case "Card":
    case "Yellow":
      return "card";
    case "Substitution":
      return "substitution";
    case "Half":
      return "half";
    case "AddedTime":
      return "added_time";
    case "Injuries":
      return "injury";
    default:
      return "other";
  }
};

const mapFactsEvent = (event: FactsEvent, index: number): MatchPlayByPlayEntry | null => {
  const type = event.type ?? "other";
  const kind = mapFactsKind(type);
  const { label, sortKey } = formatFactsMinute(event);
  const team =
    event.isHome === true ? "home" : event.isHome === false ? "away" : undefined;
  const playerName = event.nameStr ?? event.player?.name;

  if (kind === "goal") {
    const details = [event.assistStr, event.goalDescription].filter(Boolean);
    const xg = event.shotmapEvent?.expectedGoals;
    if (xg !== undefined) {
      details.push(`xG ${xg.toFixed(2)}`);
    }
    return {
      id: event.reactKey ?? `facts-goal-${index}`,
      kind,
      source: "facts",
      minute: label,
      sortKey,
      team,
      playerName,
      title: playerName ?? "Goal",
      description: details.join(" · ") || undefined,
      scoreAfter: event.newScore
        ? `${event.newScore[0]} - ${event.newScore[1]}`
        : undefined,
      isHighlight: true,
    };
  }

  if (kind === "card") {
    const cardLabel = event.card === "Red" ? "Red card" : "Yellow card";
    return {
      id: event.reactKey ?? `facts-card-${index}`,
      kind,
      source: "facts",
      minute: label,
      sortKey,
      team,
      playerName,
      title: playerName ?? cardLabel,
      description: cardLabel,
      isHighlight: event.card === "Red",
    };
  }

  if (kind === "substitution") {
    const swap = event.swap ?? [];
    const description =
      swap.length >= 2
        ? `${swap[0]?.name ?? "—"} → ${swap[1]?.name ?? "—"}`
        : undefined;
    return {
      id: event.reactKey ?? `facts-sub-${index}`,
      kind,
      source: "facts",
      minute: label,
      sortKey,
      team,
      title: "Substitution",
      playerName: swap[0]?.name,
      description,
      isHighlight: false,
    };
  }

  if (kind === "half") {
    return {
      id: event.reactKey ?? `facts-half-${index}`,
      kind,
      source: "facts",
      minute: label || event.halfStrShort || "—",
      sortKey,
      title: event.halfStrShort ?? "Half-time",
      isHighlight: false,
    };
  }

  if (kind === "added_time") {
    return {
      id: event.reactKey ?? `facts-added-${index}`,
      kind,
      source: "facts",
      minute: label,
      sortKey,
      title: event.minutesAddedStr ?? `+${event.minutesAddedInput ?? 0}'`,
      isHighlight: false,
    };
  }

  if (kind === "injury") {
    return {
      id: event.reactKey ?? `facts-injury-${index}`,
      kind,
      source: "facts",
      minute: label,
      sortKey,
      team,
      playerName,
      title: playerName ?? "Injury",
      isHighlight: false,
    };
  }

  return null;
};

const mapLtcEntry = (
  entry: MatchCommentaryView["entries"][number],
  index: number,
): MatchPlayByPlayEntry | null => {
  if (!LTC_NARRATIVE_CODES.has(entry.type)) {
    return null;
  }

  const elapsedMatch = entry.minute.match(/^(\d+)(?:\+(\d+))?'?$/);
  const base = elapsedMatch ? Number.parseInt(elapsedMatch[1], 10) : 0;
  const plus = elapsedMatch?.[2] ? Number.parseInt(elapsedMatch[2], 10) : 0;
  const sortKey =
    entry.type === "post_match summary" ? -1 : base * 100 + plus;

  return {
    id: `ltc-${entry.id}-${index}`,
    kind: entry.type === "post_match summary" ? "summary" : "comment",
    source: "ltc",
    minute: entry.minute,
    sortKey,
    team: entry.team,
    title: entry.type === "team news" ? "Team news" : undefined,
    description: entry.description,
    isHighlight: entry.isHighlight,
  };
};

const sortPlayByPlayEntries = (
  entries: MatchPlayByPlayEntry[],
): MatchPlayByPlayEntry[] =>
  [...entries].sort((a, b) => b.sortKey - a.sortKey);

export const mapMatchFactsEvents = (
  details: Record<string, unknown>,
): MatchPlayByPlayView => {
  const content = details.content as Record<string, unknown> | undefined;
  const matchFacts = content?.matchFacts as Record<string, unknown> | undefined;
  const eventsBlock = matchFacts?.events as FactsEventsBlock | undefined;
  const factsEvents = eventsBlock?.events ?? [];

  const entries: MatchPlayByPlayEntry[] = [];
  for (const [index, event] of factsEvents.entries()) {
    const mapped = mapFactsEvent(event, index);
    if (mapped) {
      entries.push(mapped);
    }
  }

  const sorted = sortPlayByPlayEntries(entries);
  return {
    entries: sorted,
    hasData: sorted.length > 0,
  };
};

export const mapMatchActionPlayByPlay = (
  details: Record<string, unknown>,
  commentsRaw: Record<string, unknown> | null | undefined,
): MatchPlayByPlayView => {
  const facts = mapMatchFactsEvents(details);
  const ltcActions = mapLtcActionEvents(commentsRaw);
  const payload = commentsRaw as LtcActionPayload | null | undefined;
  const entries = sortPlayByPlayEntries(
    dedupeActionEntries([...facts.entries, ...ltcActions]),
  );

  return {
    entries,
    hasData: entries.length > 0,
    lastUpdated: payload?.LastUpdated,
  };
};

export const mapMatchPlayByPlay = (
  details: Record<string, unknown>,
  commentary: MatchCommentaryView,
): MatchPlayByPlayView => {
  const facts = mapMatchFactsEvents(details);
  const narrative: MatchPlayByPlayEntry[] = [];

  for (const [index, entry] of commentary.entries.entries()) {
    const mapped = mapLtcEntry(entry, index);
    if (mapped) {
      narrative.push(mapped);
    }
  }

  const entries = sortPlayByPlayEntries([...facts.entries, ...narrative]);

  return {
    entries,
    hasData: entries.length > 0,
    lastUpdated: commentary.lastUpdated,
  };
};