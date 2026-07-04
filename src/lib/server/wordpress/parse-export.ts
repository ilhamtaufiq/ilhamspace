import { XMLParser } from "fast-xml-parser";

import { slugify } from "$lib/editor/slug";
import {
  cleanWordPressHtml,
  isLikelyImageUrl,
  normalizeUrl,
  parseWordPressDate,
  readArray,
  readText,
  stripHtml,
} from "$lib/server/wordpress/parse-utils";
import type {
  WordPressExportData,
  WordPressImportComment,
  WordPressImportMedia,
  WordPressImportPost,
} from "$lib/server/wordpress/types";

const IMPORTABLE_STATUSES = new Set(["publish", "draft", "private", "future"]);

const mapStatus = (
  status: string,
): WordPressImportPost["status"] | null => {
  if (status === "publish" || status === "future" || status === "private") {
    return "published";
  }

  if (status === "draft") {
    return "draft";
  }

  return null;
};

const toImportPost = (
  item: Record<string, unknown>,
): WordPressImportPost | null => {
  const postType = readText(item["wp:post_type"]);
  if (postType !== "post") {
    return null;
  }

  const wpStatus = readText(item["wp:status"]);
  if (!IMPORTABLE_STATUSES.has(wpStatus)) {
    return null;
  }

  const status = mapStatus(wpStatus);
  if (!status) {
    return null;
  }

  const wpId = readText(item["wp:post_id"]);
  const title = readText(item.title);
  const contentHtml = cleanWordPressHtml(
    readText(item["content:encoded"]) || readText(item.description),
  );

  if (!wpId || !title || !contentHtml) {
    return null;
  }

  const slugSource = readText(item["wp:post_name"]) || title;
  const slug = slugify(slugSource) || slugify(title);
  if (!slug) {
    return null;
  }

  const excerpt = cleanWordPressHtml(readText(item["excerpt:encoded"]));
  const description = excerpt ? stripHtml(excerpt) : undefined;

  const tags = readArray<Record<string, unknown>>(item.category)
    .filter((category) => {
      const domain = readText(category["@_domain"]);
      return domain === "post_tag" || domain === "category";
    })
    .map((category) => readText(category["#text"]) || readText(category))
    .map((tag) => tag.trim())
    .filter(Boolean);

  const publishedAt =
    parseWordPressDate(readText(item["wp:post_date_gmt"])) ??
    parseWordPressDate(readText(item["wp:post_date"])) ??
    parseWordPressDate(readText(item.pubDate));

  return {
    wpId,
    title,
    slug,
    contentHtml,
    description: description || undefined,
    tags,
    status,
    publishedAt: status === "published" ? publishedAt : null,
  };
};

const toImportMedia = (
  item: Record<string, unknown>,
): WordPressImportMedia | null => {
  const postType = readText(item["wp:post_type"]);
  if (postType !== "attachment") {
    return null;
  }

  const wpId = readText(item["wp:post_id"]);
  const url = readText(item["wp:attachment_url"]) || readText(item.link);

  if (!wpId || !url || !isLikelyImageUrl(url)) {
    return null;
  }

  return {
    wpId,
    url: normalizeUrl(url),
    title: readText(item.title) || wpId,
  };
};

const toImportComments = (
  item: Record<string, unknown>,
): WordPressImportComment[] => {
  const postType = readText(item["wp:post_type"]);
  if (postType !== "post") {
    return [];
  }

  const wpPostId = readText(item["wp:post_id"]);
  if (!wpPostId) {
    return [];
  }

  return readArray<Record<string, unknown>>(item["wp:comment"])
    .map((comment) => {
      if (readText(comment["wp:comment_approved"]) !== "1") {
        return null;
      }

      const wpId = readText(comment["wp:comment_id"]);
      const body = readText(comment["wp:comment_content"]);
      const authorName = readText(comment["wp:comment_author"]);
      const authorEmail = readText(comment["wp:comment_author_email"]);

      if (!wpId || !body || !authorName) {
        return null;
      }

      const createdAt =
        parseWordPressDate(readText(comment["wp:comment_date_gmt"])) ??
        parseWordPressDate(readText(comment["wp:comment_date"])) ??
        new Date();

      return {
        wpId,
        wpPostId,
        wpParentId: readText(comment["wp:comment_parent"]) || "0",
        authorName,
        authorEmail:
          authorEmail || `imported+${wpId}@wordpress.local`,
        body,
        createdAt,
      } satisfies WordPressImportComment;
    })
    .filter((comment): comment is WordPressImportComment => comment !== null);
};

export const extractImageUrlsFromHtml = (html: string): string[] => {
  const urls = new Set<string>();
  const pattern = /<img[^>]+src=["']([^"']+)["']/gi;

  for (const match of html.matchAll(pattern)) {
    const url = match[1]?.trim();
    if (url && isLikelyImageUrl(url)) {
      urls.add(normalizeUrl(url));
    }
  }

  return [...urls];
};

export const parseWordPressExport = (xml: string): WordPressExportData => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: false,
    parseTagValue: false,
    isArray: (tagName) =>
      tagName === "item" ||
      tagName === "category" ||
      tagName === "wp:comment",
  });

  const document = parser.parse(xml) as Record<string, unknown>;
  const channel = document.rss as Record<string, unknown> | undefined;
  const rssChannel = channel?.channel as Record<string, unknown> | undefined;
  const items = rssChannel?.item;

  if (!items) {
    return { posts: [], media: [], comments: [] };
  }

  const rawItems = readArray<Record<string, unknown>>(items);
  const posts: WordPressImportPost[] = [];
  const media: WordPressImportMedia[] = [];
  const comments: WordPressImportComment[] = [];

  for (const item of rawItems) {
    const post = toImportPost(item);
    if (post) {
      posts.push(post);
    }

    const attachment = toImportMedia(item);
    if (attachment) {
      media.push(attachment);
    }

    comments.push(...toImportComments(item));
  }

  return { posts, media, comments };
};