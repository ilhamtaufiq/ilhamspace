import { htmlToJson } from "$lib/editor/render";
import {
  commentExistsForImport,
  createImportedComment,
} from "$lib/db/comments";
import { getPostBySlug } from "$lib/db/posts";
import { createImportedPost } from "$lib/server/posts";
import {
  importWordPressMedia,
  rewriteHtmlUrls,
} from "$lib/server/wordpress/media";
import {
  extractImageUrlsFromHtml,
  parseWordPressExport,
} from "$lib/server/wordpress/parse-export";
import type {
  WordPressExportData,
  WordPressImportComment,
  WordPressImportPost,
  WordPressImportResult,
} from "$lib/server/wordpress/types";
import { emptySectionResult } from "$lib/server/wordpress/types";

const MAX_IMPORT_FILE_BYTES = 15 * 1024 * 1024;

const emptyImportResult = (): WordPressImportResult => ({
  posts: emptySectionResult(),
  media: emptySectionResult(),
  comments: emptySectionResult(),
  errors: [],
});

export const importWordPressExportXml = async (
  xml: string,
): Promise<WordPressImportResult> => {
  const data = parseWordPressExport(xml);
  return importWordPressExport(data);
};

export const importWordPressExport = async (
  data: WordPressExportData,
): Promise<WordPressImportResult> => {
  const result = emptyImportResult();

  if (data.posts.length === 0) {
    return result;
  }

  const contentUrls = data.posts.flatMap((post) =>
    extractImageUrlsFromHtml(post.contentHtml),
  );

  const mediaResult = await importWordPressMedia(data.media, contentUrls);
  result.media = mediaResult.section;
  result.errors.push(...mediaResult.errors);

  const postMap = await importWordPressPosts(
    data.posts,
    mediaResult.urlMap,
    result,
  );

  await importWordPressComments(data.comments, postMap, result);

  return result;
};

const importWordPressPosts = async (
  posts: WordPressImportPost[],
  urlMap: Map<string, string>,
  result: WordPressImportResult,
): Promise<Map<string, string>> => {
  const postMap = new Map<string, string>();

  const sorted = [...posts].sort((a, b) => {
    const aTime = a.publishedAt?.getTime() ?? 0;
    const bTime = b.publishedAt?.getTime() ?? 0;
    return aTime - bTime;
  });

  for (const post of sorted) {
    try {
      const existing = await getPostBySlug(post.slug);
      if (existing) {
        postMap.set(post.wpId, existing.id);
        result.posts.skipped += 1;
        continue;
      }

      const contentHtml = rewriteHtmlUrls(post.contentHtml, urlMap);
      const created = await createImportedPost({
        title: post.title,
        slug: post.slug,
        description: post.description,
        tags: post.tags.join(", "),
        status: post.status,
        contentJson: htmlToJson(contentHtml),
        publishedAt: post.publishedAt,
      });

      if (!created) {
        result.posts.skipped += 1;
        continue;
      }

      postMap.set(post.wpId, created.id);
      result.posts.imported += 1;
    } catch (error) {
      result.posts.failed += 1;
      const message =
        error instanceof Error ? error.message : "Unknown import error.";
      result.errors.push(`Post "${post.title}": ${message}`);
    }
  }

  return postMap;
};

const importWordPressComments = async (
  comments: WordPressImportComment[],
  postMap: Map<string, string>,
  result: WordPressImportResult,
): Promise<void> => {
  const wpToLocal = new Map<string, string>();
  const pending = comments.filter((comment) => postMap.has(comment.wpPostId));
  let guard = 0;

  while (pending.length > 0 && guard < pending.length * 2 + 1) {
    guard += 1;
    let progressed = false;

    for (let index = pending.length - 1; index >= 0; index -= 1) {
      const comment = pending[index];
      const hasParent =
        comment.wpParentId && comment.wpParentId !== "0";

      if (hasParent && !wpToLocal.has(comment.wpParentId)) {
        continue;
      }

      const postId = postMap.get(comment.wpPostId);
      if (!postId) {
        pending.splice(index, 1);
        result.comments.skipped += 1;
        continue;
      }

      const duplicate = await commentExistsForImport(
        postId,
        comment.authorEmail,
        comment.body,
        comment.createdAt,
      );

      if (duplicate) {
        pending.splice(index, 1);
        result.comments.skipped += 1;
        continue;
      }

      const parentId = hasParent
        ? (wpToLocal.get(comment.wpParentId) ?? null)
        : null;

      try {
        const created = await createImportedComment({
          postId,
          parentId: parentId ?? undefined,
          authorName: comment.authorName,
          authorEmail: comment.authorEmail,
          body: comment.body,
          createdAt: comment.createdAt,
        });

        if (!created) {
          result.comments.failed += 1;
          result.errors.push(
            `Comment by ${comment.authorName}: could not save.`,
          );
        } else {
          wpToLocal.set(comment.wpId, created.id);
          result.comments.imported += 1;
        }
      } catch (error) {
        result.comments.failed += 1;
        const message =
          error instanceof Error ? error.message : "Unknown import error.";
        result.errors.push(`Comment by ${comment.authorName}: ${message}`);
      }

      pending.splice(index, 1);
      progressed = true;
    }

    if (!progressed) {
      for (const comment of pending) {
        result.comments.failed += 1;
        result.errors.push(
          `Comment by ${comment.authorName}: parent comment missing.`,
        );
      }
      break;
    }
  }
};

export const readWordPressExportFile = async (
  file: File,
): Promise<string | { error: string }> => {
  if (file.size === 0) {
    return { error: "Export file is empty." };
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return { error: "Export file is too large (max 15 MB)." };
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".xml")) {
    return { error: "Upload a WordPress export (.xml) file." };
  }

  const xml = await file.text();
  if (!xml.includes("<rss") || !xml.includes("<item")) {
    return { error: "File does not look like a WordPress export." };
  }

  return xml;
};