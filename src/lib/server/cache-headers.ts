const IMMUTABLE_STATIC_RE =
  /^\/(?:_app\/immutable\/|fonts\/|favicon\.svg|ilhamspace-logo-pixel\.png)/;

const LOGO_RE = /^\/logo(?:-ilhamspace)?\.jpe?g$/;

const IMMUTABLE_EXT_RE = /\.(?:woff2?|png|jpe?g|webp|svg|ico|gif|avif)$/i;

export const applyCacheHeaders = (
  pathname: string,
  headers: Headers,
): void => {
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

  const contentType = headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    headers.set("Cache-Control", "no-store");
  }
};