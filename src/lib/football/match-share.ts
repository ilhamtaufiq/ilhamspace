import { translate, type Locale } from "$lib/i18n";

export type MatchShareInput = {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  matchMinute: string;
  isLive: boolean;
  isFinished: boolean;
  statusShort: string;
  statusLong: string;
  roundLabel: string;
  kickoffLabel: string;
  insights?: string[];
};

const isHalftime = (input: MatchShareInput): boolean => {
  const minute = input.matchMinute.trim().toUpperCase();
  const status = input.statusShort.trim().toUpperCase();
  return minute === "HT" || status === "HT";
};

export const buildMatchShareMessage = (
  locale: Locale,
  input: MatchShareInput,
): string => {
  const vars = {
    home: input.homeName,
    away: input.awayName,
    homeScore: String(input.homeScore),
    awayScore: String(input.awayScore),
    minute: input.matchMinute,
    status: input.statusLong || input.statusShort || "—",
    round: input.roundLabel,
    kickoff: input.kickoffLabel,
  };

  let message = "";

  if (isHalftime(input)) {
    message = translate(locale, "football.shareHalftime", vars);
  } else if (input.isLive) {
    message = input.matchMinute
      ? translate(locale, "football.shareLiveMinute", vars)
      : translate(locale, "football.shareLive", vars);
  } else if (input.isFinished) {
    message = translate(locale, "football.shareFinished", vars);
  } else if (input.statusShort) {
    message = translate(locale, "football.shareStatus", vars);
  } else {
    message = translate(locale, "football.shareScheduled", vars);
  }

  const insight = input.insights?.[0]?.trim();
  if (insight) {
    message = `${message}\n▸ ${insight}`;
  }

  return message;
};