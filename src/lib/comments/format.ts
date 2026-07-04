import type { Locale } from "$lib/i18n/constants";
import { getDateLocale } from "$lib/i18n";

export const formatCommentTime = (date: Date, locale: Locale): string => {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return locale === "id" ? "baru saja" : "just now";
  }

  if (diffMinutes < 60) {
    return locale === "id"
      ? `${diffMinutes} mnt lalu`
      : `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return locale === "id" ? `${diffHours} jam lalu` : `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return locale === "id" ? `${diffDays} hr lalu` : `${diffDays}d ago`;
  }

  return date.toLocaleDateString(getDateLocale(locale), {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};