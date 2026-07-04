import { error } from "@sveltejs/kit";
import { z } from "zod";

import { fetchFotmobStream } from "$lib/server/fotmob";

import type { RequestHandler } from "./$types";

const matchIdSchema = z.coerce.number().int().positive();
const upstreamSchema = z.string().url();

export const GET: RequestHandler = async ({ params, url, request }) => {
  const parsed = matchIdSchema.safeParse(params.matchId);
  if (!parsed.success) {
    error(404, "Match not found");
  }

  const upstreamUrl = upstreamSchema.safeParse(url.searchParams.get("u"));
  if (!upstreamUrl.success) {
    error(400, "Missing upstream URL");
  }

  const rangeHeader = request.headers.get("range");
  const upstream = await fetchFotmobStream(
    `/audio/proxy?u=${encodeURIComponent(upstreamUrl.data)}`,
    rangeHeader ? { headers: { Range: rangeHeader } } : undefined,
  );

  if (!upstream.ok && upstream.status !== 206) {
    error(upstream.status, "Audio segment unavailable");
  }

  const headers = new Headers();
  headers.set("access-control-allow-origin", "*");
  headers.set(
    "cache-control",
    upstream.headers.get("cache-control") ?? "public, max-age=60",
  );

  for (const name of ["content-range", "accept-ranges", "content-length"]) {
    const value = upstream.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const contentType = (
    upstream.headers.get("content-type") ?? "application/octet-stream"
  )
    .split(";")[0]
    .trim();
  headers.set("content-type", contentType);

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
};