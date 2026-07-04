import { readFile } from "node:fs/promises";

import { error, type RequestHandler } from "@sveltejs/kit";

import { resolveUploadPath } from "$lib/server/uploads";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export const GET: RequestHandler = async ({ params }) => {
  const filename = params.filename;
  if (!filename) {
    error(400, "Invalid filename");
  }

  const filePath = resolveUploadPath(filename);
  if (!filePath) {
    error(400, "Invalid filename");
  }

  try {
    const data = await readFile(filePath);
    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";

    return new Response(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    error(404, "File not found");
  }
};