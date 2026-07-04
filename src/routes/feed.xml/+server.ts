import { getPublishedPosts } from "$lib/db/posts";
import { getSiteUrl, siteConfig } from "$lib/config/site";

import type { RequestHandler } from "./$types";

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET: RequestHandler = async () => {
  const siteUrl = getSiteUrl();
  const posts = await getPublishedPosts();

  const items = posts
    .map((post) => {
      const publishedAt = post.publishedAt ?? post.createdAt;
      const link = `${siteUrl}/notes/${post.slug}`;
      const description = post.description
        ? `<description>${escapeXml(post.description)}</description>`
        : "";

      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  <pubDate>${publishedAt.toUTCString()}</pubDate>
  ${description}
</item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};