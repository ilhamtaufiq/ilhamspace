import { json, type RequestHandler } from "@sveltejs/kit";

import { saveUploadedImage } from "$lib/server/save-upload";

const handleUpload: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return json({ error: "No image file provided." }, { status: 400 });
  }

  const result = await saveUploadedImage(file);
  if (!result.ok) {
    return json({ error: result.error }, { status: 400 });
  }

  return json({ url: result.url });
};

export const POST = handleUpload;