const IMMUTABLE_STATIC_RE =
  /^\/(?:_app\/immutable\/|fonts\/|favicon\.svg|ilhamspace-logo-pixel\.png)/;

const LOGO_RE = /^\/logo(?:-ilhamspace)?\.jpe?g$/;

const IMMUTABLE_EXT_RE = /\.(?:woff2?|png|jpe?g|webp|svg|ico|gif|avif)$/i;

const DOCUMENT_CACHE_CONTROL = "private, no-cache, must-revalidate";

/** HTML shells must revalidate so deploys never serve stale JS chunk URLs. */
export const applyDocumentCacheHeaders = (headers: Headers): void => {
  headers.set("Cache-Control", DOCUMENT_CACHE_CONTROL);
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
};

export const applyCacheHeaders = (
  pathname: string,
  headers: Headers,
): void => {
  const contentType = headers.get("content-type") ?? "";

  if (contentType.includes("text/html")) {
    applyDocumentCacheHeaders(headers);
    return;
  }

  if (pathname === "/_app/version.json") {
    headers.set("Cache-Control", "no-cache, must-revalidate");
    return;
  }

  if (headers.has("cache-control")) {
    return;
  }

  if (LOGO_RE.test(pathname)) {
    headers.set("Cache-Control", "public, max-age=86400, must-revalidate");
    return;
  }

  if (IMMUTABLE_STATIC_RE.test(pathname) || IMMUTABLE_EXT_RE.test(pathname)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return;
  }
};