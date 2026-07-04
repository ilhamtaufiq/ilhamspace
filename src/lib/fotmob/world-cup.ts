import type {
  KnockoutMatchupView,
  KnockoutRoundView,
  LeaguePlayoffData,
  PlayoffMatchup,
} from "$lib/fotmob/types";

const ROUND_LABELS: Record<string, { id: string; en: string; short: string }> = {
  "1/16": { id: "Babak 32", en: "Round of 32", short: "B32" },
  "1/8": { id: "Babak 16", en: "Round of 16", short: "B16" },
  "1/4": { id: "Perempat Final", en: "Quarter-finals", short: "B8" },
  "1/2": { id: "Semi Final", en: "Semi-finals", short: "SF" },
  final: { id: "Final", en: "Final", short: "F" },
};

export const getRoundLabel = (stage: string, locale: "id" | "en"): string => {
  const entry = ROUND_LABELS[stage];
  if (entry) {
    return locale === "id" ? entry.id : entry.en;
  }
  return stage;
};

export const getRoundShortLabel = (stage: string): string => {
  return ROUND_LABELS[stage]?.short ?? stage;
};

/** Slot height (px) for bracket column alignment */
export const BRACKET_SLOT_HEIGHT = 76;

const formatScore = (matchup: PlayoffMatchup): string => {
  const match = matchup.matches?.[0];
  if (match?.status?.scoreStr) {
    return match.status.scoreStr;
  }
  if (
    matchup.homeScore !== undefined &&
    matchup.awayScore !== undefined &&
    (matchup.homeScore > 0 || matchup.awayScore > 0)
  ) {
    return `${matchup.homeScore} - ${matchup.awayScore}`;
  }
  return "—";
};

const formatStatus = (matchup: PlayoffMatchup): string => {
  const match = matchup.matches?.[0];
  const status = match?.status;
  if (!status) {
    return "";
  }
  if (status.finished) {
    return status.reason?.short ?? "FT";
  }
  if (status.started) {
    return "LIVE";
  }
  if (status.utcTime) {
    const date = new Date(status.utcTime);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return "";
};

const mapMatchup = (matchup: PlayoffMatchup, stage: string): KnockoutMatchupView => {
  const match = matchup.matches?.[0];
  const homeTbd = matchup.tbdTeam1 === true;
  const awayTbd = matchup.tbdTeam2 === true;
  const winner =
    matchup.aggregatedWinner ?? matchup.winner ?? undefined;

  return {
    id: `${stage}-${matchup.drawOrder ?? matchup.homeTeamId ?? "tbd"}`,
    stage,
    homeName: homeTbd ? "TBD" : (matchup.homeTeam ?? "TBD"),
    awayName: awayTbd ? "TBD" : (matchup.awayTeam ?? "TBD"),
    homeShort: homeTbd ? "TBD" : (matchup.homeTeamShortName ?? "—"),
    awayShort: awayTbd ? "TBD" : (matchup.awayTeamShortName ?? "—"),
    homeTeamId: homeTbd ? undefined : matchup.homeTeamId,
    awayTeamId: awayTbd ? undefined : matchup.awayTeamId,
    score: formatScore(matchup),
    statusLabel: formatStatus(matchup),
    winnerTeamId: winner,
    matchId: match?.matchId,
    isTbd: homeTbd || awayTbd,
    isLive: match?.status?.started === true && match?.status?.finished !== true,
    isFinished: match?.status?.finished === true,
  };
};

export const mapPlayoffToBracket = (
  data: LeaguePlayoffData,
  locale: "id" | "en",
): KnockoutRoundView[] => {
  return data.rounds.map((round) => ({
    stage: round.stage,
    label: getRoundLabel(round.stage, locale),
    matchups: round.matchups.map((matchup) => mapMatchup(matchup, round.stage)),
  }));
};