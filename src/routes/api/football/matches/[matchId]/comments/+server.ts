import { error } from "@sveltejs/kit";
import { z } from "zod";

import { mapMatchCommentary } from "$lib/fotmob/match-commentary";
import { getMatchComments } from "$lib/server/fotmob";

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

  const raw = await getMatchComments(parsed.data);
  const commentary = mapMatchCommentary(raw);

  return Response.json(commentary);
};