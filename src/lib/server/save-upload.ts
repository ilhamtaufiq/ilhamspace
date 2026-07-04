import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  extensionForMime,
  getUploadsDir,
  sniffImageMime,
  sniffImageMimeFromBuffer,
  validateImageBytes,
} from "$lib/server/uploads";

export type SaveUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export const saveUploadedImage = async (file: File): Promise<SaveUploadResult> => {
  const mime = await sniffImageMime(file);
  if (!mime) {
    return { ok: false, error: "Could not detect image type." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const validation = validateImageBytes(buffer, mime);
  if (!validation.ok) {
    return { ok: false, error: validation.message };
  }

  const filename = `${randomUUID()}${extensionForMime(mime)}`;
  const filePath = join(getUploadsDir(), filename);

  try {
    await writeFile(filePath, buffer);
    return { ok: true, url: `/uploads/${filename}` };
  } catch (error) {
    console.error("[save-upload] error:", error);
    return { ok: false, error: "Failed to save image." };
  }
};

export const saveImageBuffer = async (
  buffer: Buffer,
): Promise<SaveUploadResult> => {
  const mime = sniffImageMimeFromBuffer(buffer);
  if (!mime) {
    return { ok: false, error: "Could not detect image type." };
  }

  const validation = validateImageBytes(buffer, mime);
  if (!validation.ok) {
    return { ok: false, error: validation.message };
  }

  const filename = `${randomUUID()}${extensionForMime(mime)}`;
  const filePath = join(getUploadsDir(), filename);

  try {
    await writeFile(filePath, buffer);
    return { ok: true, url: `/uploads/${filename}` };
  } catch (error) {
    console.error("[save-upload] buffer error:", error);
    return { ok: false, error: "Failed to save image." };
  }
};