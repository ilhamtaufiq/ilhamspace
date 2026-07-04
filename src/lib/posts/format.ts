import type { Locale } from "$lib/i18n/constants";
import { getDateLocale } from "$lib/i18n";
import type { Post } from "$lib/db/schema";

export type NoteListItem = {
  id: string;
  slug: string;
  title: string;
  year: number;
  dateISO: string;
  dateTitle: string;
  dateDisplay: string;
};

export const formatPostDateTitle = (date: Date, locale: Locale): string =>
  date.toLocaleString(getDateLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

export const formatPostListItem = (post: Post, locale: Locale): NoteListItem => {
  const date = post.publishedAt ?? post.createdAt;
  const dateLocale = getDateLocale(locale);
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    year: date.getUTCFullYear(),
    dateISO: date.toISOString(),
    dateTitle: formatPostDateTitle(date, locale),
    dateDisplay: date.toLocaleDateString(dateLocale, {
      month: "short",
      day: "numeric",
    }),
  };
};

export const formatPostPreview = (
  post: Post,
  locale: Locale,
): Pick<NoteListItem, "slug" | "title" | "dateISO" | "dateDisplay"> => {
  const date = post.publishedAt ?? post.createdAt;
  return {
    slug: post.slug,
    title: post.title,
    dateISO: date.toISOString(),
    dateDisplay: date.toLocaleDateString(getDateLocale(locale), {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
};