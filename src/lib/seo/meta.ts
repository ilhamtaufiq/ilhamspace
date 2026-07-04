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
    inLanguage: ["id", "en"],
  };
};

export const buildArticleJsonLd = (input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  modifiedAt?: string;
}): JsonLd => {
  const siteUrl = getSiteUrl();
  const url = buildCanonicalUrl(input.path);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: url,
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