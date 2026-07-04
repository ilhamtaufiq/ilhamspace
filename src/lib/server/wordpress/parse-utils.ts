export const readText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.__cdata === "string") {
      return record.__cdata.trim();
    }
    if (typeof record["#text"] === "string") {
      return record["#text"].trim();
    }
  }

  return "";
};

export const readArray = <T extends Record<string, unknown>>(
  value: unknown,
): T[] => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? (value as T[]) : [value as T];
};

export const cleanWordPressHtml = (html: string): string =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[[^\]]+\]/g, "")
    .trim();

export const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export const parseWordPressDate = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const withZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(normalized)
    ? normalized
    : `${normalized}Z`;

  const parsed = new Date(withZone);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.trim();
  }
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i;

export const isLikelyImageUrl = (url: string): boolean =>
  IMAGE_EXTENSIONS.test(url) || url.includes("/wp-content/uploads/");