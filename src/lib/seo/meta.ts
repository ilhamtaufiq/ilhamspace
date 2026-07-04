import { getSiteUrl, siteConfig } from "$lib/config/site";

export type JsonLd = Record<string, unknown>;

export const truncateDescription = (
  text: string,
  maxLength = 160,
): string => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
};

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const buildCanonicalUrl = (path: string): string => {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
};

const isAbsoluteUrl = (url: string): boolean => /^https?:\/\//i.test(url);

export const buildAbsoluteUrl = (pathOrUrl: string): string => {
  const value = pathOrUrl.trim();
  if (!value) {
    return buildDefaultOgImageUrl();
  }

  if (isAbsoluteUrl(value)) {
    return value;
  }

  const siteUrl = getSiteUrl();
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${siteUrl}${normalizedPath}`;
};

export const buildDefaultOgImageUrl = (): string =>
  buildAbsoluteUrl(siteConfig.defaultOgImagePath);

export const resolveOgImageUrl = (image?: string | null): string =>
  image?.trim() ? buildAbsoluteUrl(image) : buildDefaultOgImageUrl();

export const buildMatchOgImagePath = (matchId: number): string =>
  `/api/og/football/match/${matchId}`;

export const buildMatchInsightsSummary = (
  insights: string[],
  maxLength = 300,
): string => {
  if (insights.length === 0) {
    return "";
  }

  let summary = "";
  for (const insight of insights) {
    const part = `▸ ${insight.trim()}`;
    const next = summary ? `${summary} ${part}` : part;
    if (next.length > maxLength) {
      break;
    }
    summary = next;
  }

  return summary || truncateDescription(`▸ ${insights[0].trim()}`, maxLength);
};

export const buildMatchShareTitle = (input: {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  roundLabel: string;
  isLive: boolean;
  matchMinute: string;
  statusShort: string;
}): string => {
  const scoreLine = `${input.homeName} ${input.homeScore}-${input.awayScore} ${input.awayName}`;
  const status = input.matchMinute
    ? input.matchMinute
    : input.isLive
      ? "LIVE"
      : input.statusShort;
  return status
    ? `${scoreLine} · ${input.roundLabel} · ${status}`
    : `${scoreLine} · ${input.roundLabel}`;
};

const IMG_SRC_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i;

export const extractFirstImageFromHtml = (html: string): string | null => {
  const match = IMG_SRC_RE.exec(html);
  return match?.[1]?.trim() ?? null;
};

export const buildPageTitle = (
  title: string,
  siteName: string = siteConfig.name,
): string => `${title} · ${siteName}`;

export const buildWebsiteJsonLd = (): JsonLd => {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    image: buildDefaultOgImageUrl(),
    inLanguage: ["id", "en"],
  };
};

export const buildArticleJsonLd = (input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  modifiedAt?: string;
  image?: string | null;
}): JsonLd => {
  const siteUrl = getSiteUrl();
  const url = buildCanonicalUrl(input.path);
  const imageUrl = resolveOgImageUrl(input.image);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: url,
    image: [imageUrl],
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt ?? input.publishedAt,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
    inLanguage: ["id", "en"],
  };
};

export const serializeJsonLd = (data: JsonLd | JsonLd[]): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");