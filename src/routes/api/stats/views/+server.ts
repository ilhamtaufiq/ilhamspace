import { json, type RequestHandler } from "@sveltejs/kit";

import {
  fetchUmamiPageViewsBatch,
  normalizeUmamiPath,
} from "$lib/server/umami";

export const GET: RequestHandler = async ({ url }) => {
  const pathsParam = url.searchParams.get("paths") ?? url.searchParams.get("path");

  if (!pathsParam) {
    return json({ error: "Missing path or paths query." }, { status: 400 });
  }

  const rawPaths = pathsParam
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);

  if (rawPaths.length === 0) {
    return json({ error: "No valid paths provided." }, { status: 400 });
  }

  if (rawPaths.length > 30) {
    return json({ error: "Too many paths (max 30)." }, { status: 400 });
  }

  const viewsByPath = await fetchUmamiPageViewsBatch(rawPaths);

  if (rawPaths.length === 1) {
    const path = normalizeUmamiPath(rawPaths[0]);
    return json({
      path,
      views: viewsByPath[path] ?? null,
    });
  }

  return json({ views: viewsByPath });
};