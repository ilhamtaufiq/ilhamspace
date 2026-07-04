import { error } from "@sveltejs/kit";
import { z } from "zod";

import { mapMatchActionPlayByPlay } from "$lib/fotmob/match-playbyplay";
import { getMatchComments, getMatchDetails } from "$lib/server/fotmob";

import type { RequestHandler } from "./$types";

const matchIdSchema = z.coerce.number().int().positive();

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const parsed = matchIdSchema.safeParse(params.matchId);
  if (!parsed.success) {
    error(404, "Match not found");
  }

  setHeaders({
    "cache-control": "public, max-age=30, stale-while-revalidate=60",
  });

  const [details, commentsRaw] = await Promise.all([
    getMatchDetails(parsed.data),
    getMatchComments(parsed.data),
  ]);

  const playByPlay = mapMatchActionPlayByPlay(details, commentsRaw);

  return Response.json(playByPlay);
};