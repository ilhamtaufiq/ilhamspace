import { saveImageBuffer } from "$lib/server/save-upload";
import { normalizeUrl } from "$lib/server/wordpress/parse-utils";
import type {
  WordPressImportMedia,
  WordPressImportSectionResult,
} from "$lib/server/wordpress/types";
import { emptySectionResult } from "$lib/server/wordpress/types";

const DOWNLOAD_TIMEOUT_MS = 15_000;
const SCALED_SUFFIX_RE = /-\d+x\d+(\.(jpe?g|png|gif|webp|avif))(\?.*)?$/i;

const scaledVariants = (url: string): string[] => {
  const variants = new Set<string>();
  const withoutQuery = url.replace(/\?.*$/, "");
  const scaled = withoutQuery.replace(SCALED_SUFFIX_RE, "$1");

  if (scaled !== withoutQuery) {
    variants.add(normalizeUrl(scaled));
    variants.add(normalizeUrl(`${scaled}${url.includes("?") ? url.slice(url.indexOf("?")) : ""}`));
  }

  return [...variants];
};

const addUrlMapping = (
  urlMap: Map<string, string>,
  sourceUrl: string,
  localUrl: string,
): void => {
  urlMap.set(normalizeUrl(sourceUrl), localUrl);

  for (const variant of scaledVariants(sourceUrl)) {
    urlMap.set(variant, localUrl);
  }
};

const downloadImage = async (url: string): Promise<Buffer | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ilhamspace-wordpress-import/1.0" },
    });

    if (!response.ok) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.byteLength > 0 ? buffer : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export type WordPressMediaImportResult = {
  urlMap: Map<string, string>;
  section: WordPressImportSectionResult;
  errors: string[];
};

export const importWordPressMedia = async (
  media: WordPressImportMedia[],
  extraUrls: string[] = [],
): Promise<WordPressMediaImportResult> => {
  const section = emptySectionResult();
  const errors: string[] = [];
  const urlMap = new Map<string, string>();
  const seen = new Set<string>();

  const queue: Array<{ url: string; label: string }> = [
    ...media.map((item) => ({ url: item.url, label: item.title })),
    ...extraUrls.map((url) => ({ url, label: url })),
  ];

  for (const item of queue) {
    const normalized = normalizeUrl(item.url);
    if (seen.has(normalized) || urlMap.has(normalized)) {
      section.skipped += 1;
      continue;
    }

    seen.add(normalized);

    const buffer = await downloadImage(item.url);
    if (!buffer) {
      section.failed += 1;
      errors.push(`Media: could not download ${item.label}`);
      continue;
    }

    const saved = await saveImageBuffer(buffer);
    if (!saved.ok) {
      section.failed += 1;
      errors.push(`Media: ${item.label} — ${saved.error}`);
      continue;
    }

    addUrlMapping(urlMap, item.url, saved.url);
    section.imported += 1;
  }

  return { urlMap, section, errors };
};

export const rewriteHtmlUrls = (
  html: string,
  urlMap: Map<string, string>,
): string => {
  if (urlMap.size === 0) {
    return html;
  }

  let result = html;

  const entries = [...urlMap.entries()].sort(
    (a, b) => b[0].length - a[0].length,
  );

  for (const [sourceUrl, localUrl] of entries) {
    result = result.split(sourceUrl).join(localUrl);
  }

  return result;
};