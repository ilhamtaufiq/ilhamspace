import { error } from "@sveltejs/kit";
import { z } from "zod";

import { mapMatchFactsEvents } from "$lib/fotmob/match-playbyplay";
import { getMatchDetails } from "$lib/server/fotmob";

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

  const details = await getMatchDetails(parsed.data);
  const matchFacts = mapMatchFactsEvents(details);

  return Response.json(matchFacts);
};