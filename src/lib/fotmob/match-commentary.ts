import type { MatchCommentaryEntry, MatchCommentaryView } from "$lib/fotmob/types";

type LtcEvent = {
  IncidentCode?: string;
  Elapsed?: number;
  ElapsedPlus?: number;
  Description?: string;
  IncludeInHighlight?: boolean;
  HometeamEvent?: boolean;
};

type LtcPayload = {
  Events?: LtcEvent[];
  LastUpdated?: string;
};

const formatMinute = (elapsed: number, plus: number): string => {
  if (elapsed <= 0 && plus < 0) {
    return "";
  }
  if (plus > 0) {
    return `${elapsed}+${plus}'`;
  }
  return `${elapsed}'`;
};

const mapTeam = (isHome: boolean | undefined): "home" | "away" | undefined => {
  if (isHome === true) {
    return "home";
  }
  if (isHome === false) {
    return "away";
  }
  return undefined;
};

const mapEntry = (event: LtcEvent, index: number): MatchCommentaryEntry => {
  const code = event.IncidentCode ?? "comment";
  const elapsed = event.Elapsed ?? 0;
  const plus = event.ElapsedPlus ?? -1;

  return {
    id: `${code}-${elapsed}-${plus}-${index}`,
    minute:
      code === "post_match summary"
        ? "FT"
        : formatMinute(elapsed, plus > 0 ? plus : -1),
    type: code,
    description: event.Description ?? "",
    isHighlight: event.IncludeInHighlight === true,
    team: mapTeam(event.HometeamEvent),
  };
};

export const mapMatchCommentary = (
  raw: Record<string, unknown> | null | undefined,
): MatchCommentaryView => {
  const payload = raw as LtcPayload | null | undefined;
  const events = payload?.Events;

  if (!events || events.length === 0) {
    return { entries: [], hasData: false };
  }

  const summary = events.find(
    (event) => event.IncidentCode === "post_match summary",
  );
  const liveEvents = events.filter(
    (event) => event.IncidentCode !== "post_match summary",
  );

  const entries = [
    ...liveEvents.map((event, index) => mapEntry(event, index)),
    ...(summary ? [mapEntry(summary, events.length)] : []),
  ].filter((entry) => entry.description.length > 0);

  return {
    entries,
    hasData: entries.length > 0,
    lastUpdated: payload?.LastUpdated,
  };
};