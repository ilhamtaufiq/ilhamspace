import { getSiteUrl } from "$lib/config/site";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const siteUrl = getSiteUrl();

  const body = `User-agent: *
Allow: /
Allow: /api/og/
Disallow: /admin
Disallow: /login
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};