import { getPublishedPosts } from "$lib/db/posts";
import { getSiteUrl } from "$lib/config/site";

import type { RequestHandler } from "./$types";

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const formatLastmod = (date: Date): string => date.toISOString().slice(0, 10);

export const GET: RequestHandler = async () => {
  const siteUrl = getSiteUrl();
  const posts = await getPublishedPosts();

  const staticPages = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/notes", changefreq: "weekly", priority: "0.9" },
    { path: "/projects", changefreq: "monthly", priority: "0.8" },
  ];

  const staticEntries = staticPages
    .map(
      (page) => `<url>
  <loc>${escapeXml(`${siteUrl}${page.path}`)}</loc>
  <changefreq>${page.changefreq}</changefreq>
  <priority>${page.priority}</priority>
</url>`,
    )
    .join("\n");

  const postEntries = posts
    .map((post) => {
      const lastmod = formatLastmod(post.updatedAt ?? post.publishedAt ?? post.createdAt);
      return `<url>
  <loc>${escapeXml(`${siteUrl}/notes/${post.slug}`)}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${postEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};