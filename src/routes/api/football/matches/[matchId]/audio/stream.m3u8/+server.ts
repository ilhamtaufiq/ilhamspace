import { error } from "@sveltejs/kit";
import { z } from "zod";

import { fetchFotmobStream, getFotmobApiUrl } from "$lib/server/fotmob";

import type { RequestHandler } from "./$types";

const matchIdSchema = z.coerce.number().int().positive();
const langSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/);

export const GET: RequestHandler = async ({ params, url, setHeaders }) => {
  const parsed = matchIdSchema.safeParse(params.matchId);
  if (!parsed.success) {
    error(404, "Match not found");
  }

  const lang = langSchema.safeParse(url.searchParams.get("lang") ?? "ENG");
  if (!lang.success) {
    error(400, "Invalid language code");
  }

  const upstream = await fetchFotmobStream(
    `/audio/matches/${parsed.data}/stream.m3u8?lang=${lang.data}`,
  );

  if (!upstream.ok) {
    error(upstream.status, "Audio stream unavailable");
  }

  const fotmobBase = getFotmobApiUrl();
  const proxyBase = `/api/football/matches/${parsed.data}/audio/proxy`;
  const body = (await upstream.text())
    .replaceAll(`${fotmobBase}/audio/proxy`, proxyBase)
    .replaceAll("/audio/proxy", proxyBase);

  setHeaders({
    "cache-control": "no-cache, no-store, must-revalidate",
    "access-control-allow-origin": "*",
  });

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/vnd.apple.mpegurl",
    },
  });
};