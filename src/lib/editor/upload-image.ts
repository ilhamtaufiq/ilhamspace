const UPLOAD_URL = "/api/uploads";

export const uploadEditorImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (body.trimStart().startsWith("<")) {
    throw new Error(
      "Upload returned HTML. Log in to admin and restart the dev server (pnpm dev).",
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Unexpected upload response (${response.status}).`);
  }

  let payload: { url?: string; error?: string };
  try {
    payload = JSON.parse(body) as { url?: string; error?: string };
  } catch {
    throw new Error("Upload returned invalid JSON.");
  }

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? `Upload failed (${response.status}).`);
  }

  return payload.url;
};