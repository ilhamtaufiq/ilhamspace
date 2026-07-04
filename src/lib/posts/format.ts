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

export const formatPostDateTitle = (date: Date): string =>
  date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

export const formatPostListItem = (post: Post): NoteListItem => {
  const date = post.publishedAt ?? post.createdAt;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    year: date.getUTCFullYear(),
    dateISO: date.toISOString(),
    dateTitle: formatPostDateTitle(date),
    dateDisplay: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };
};

export const formatPostPreview = (
  post: Post,
): Pick<NoteListItem, "slug" | "title" | "dateISO" | "dateDisplay"> => {
  const date = post.publishedAt ?? post.createdAt;
  return {
    slug: post.slug,
    title: post.title,
    dateISO: date.toISOString(),
    dateDisplay: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
};