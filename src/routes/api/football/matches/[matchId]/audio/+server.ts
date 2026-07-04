import { error } from "@sveltejs/kit";
import { z } from "zod";

import { mapMatchAudio } from "$lib/fotmob/match-audio";
import { getMatchAudio } from "$lib/server/fotmob";

import type { RequestHandler } from "./$types";

const matchIdSchema = z.coerce.number().int().positive();

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const parsed = matchIdSchema.safeParse(params.matchId);
  if (!parsed.success) {
    error(404, "Match not found");
  }

  setHeaders({
    "cache-control": "private, no-cache, no-store, must-revalidate",
  });

  const raw = await getMatchAudio(parsed.data);
  return Response.json(mapMatchAudio(raw, parsed.data));
};