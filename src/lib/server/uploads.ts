import { mkdirSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

import { getDatabasePath } from "$lib/db/path";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const getUploadsDir = (): string => {
  const dir = join(dirname(getDatabasePath()), "uploads");
  mkdirSync(dir, { recursive: true });
  return dir;
};

export const sanitizeUploadFilename = (filename: string): string | null => {
  const base = filename.replace(/\\/g, "/").split("/").pop() ?? "";
  if (!/^[a-zA-Z0-9._-]+$/.test(base)) {
    return null;
  }
  return base;
};

export const resolveUploadPath = (filename: string): string | null => {
  const safe = sanitizeUploadFilename(filename);
  if (!safe) {
    return null;
  }

  const uploadsDir = resolve(getUploadsDir());
  const filePath = resolve(uploadsDir, safe);
  if (filePath !== uploadsDir && !filePath.startsWith(`${uploadsDir}${sep}`)) {
    return null;
  }

  return filePath;
};

export const sniffImageMimeFromBuffer = (buffer: Buffer): string | null => {
  const header = new Uint8Array(buffer.subarray(0, 12));

  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e) {
    return "image/png";
  }

  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    header[0] === 0x47 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x38
  ) {
    return "image/gif";
  }

  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
};

export const sniffImageMime = async (file: File): Promise<string | null> => {
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) {
    return file.type;
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const fromBuffer = sniffImageMimeFromBuffer(Buffer.from(header));
  if (fromBuffer) {
    return fromBuffer;
  }

  return file.type && ALLOWED_MIME_TYPES.has(file.type) ? file.type : null;
};

export const validateImageBytes = (
  buffer: Buffer,
  mime: string,
): { ok: true } | { ok: false; message: string } => {
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    return {
      ok: false,
      message: "Only JPEG, PNG, GIF, WebP, and AVIF images are allowed.",
    };
  }

  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "Image must be 5 MB or smaller." };
  }

  return { ok: true };
};

export const extensionForMime = (mime: string): string => {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    case "image/avif":
      return ".avif";
    default:
      return ".bin";
  }
};