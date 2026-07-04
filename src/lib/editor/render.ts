import { generateHTML, generateJSON } from "@tiptap/html";

import { getRenderExtensions } from "$lib/editor/extensions";

export const renderPostHtml = (contentJson: string): string => {
  const doc = JSON.parse(contentJson) as Record<string, unknown>;
  return generateHTML(doc, getRenderExtensions());
};

export const htmlToJson = (html: string): string => {
  const doc = generateJSON(html, getRenderExtensions());
  return JSON.stringify(doc);
};