const IMG_TAG_RE = /<img\b([^>]*?)>/gi;

export const optimizeContentHtmlImages = (html: string): string => {
  let isFirstImage = true;

  return html.replace(IMG_TAG_RE, (tag, attrs: string) => {
    let next = attrs;

    if (!/\bloading\s*=/i.test(next)) {
      const loading = isFirstImage ? "eager" : "lazy";
      isFirstImage = false;
      next = ` loading="${loading}"${next}`;
    } else {
      isFirstImage = false;
    }

    if (!/\bdecoding\s*=/i.test(next)) {
      next = ` decoding="async"${next}`;
    }

    return `<img${next}>`;
  });
};