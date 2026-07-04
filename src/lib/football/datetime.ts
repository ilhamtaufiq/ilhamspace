import { DISPLAY_TIME_ZONE } from "$lib/i18n/constants";
import { getDateLocale, type Locale } from "$lib/i18n";

export const formatFootballKickoff = (
  utc: string | undefined,
  locale: Locale,
): string => {
  if (!utc) {
    return "—";
  }

  const date = new Date(utc);
  return date.toLocaleString(getDateLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
    timeZoneName: "short",
  });
};

export const formatFootballShortDateTime = (
  utc: string | undefined,
  locale: Locale,
): string => {
  if (!utc) {
    return "";
  }

  const date = new Date(utc);
  return date.toLocaleString(getDateLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
    timeZoneName: "short",
  });
};