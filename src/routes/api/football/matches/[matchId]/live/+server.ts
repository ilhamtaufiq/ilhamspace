import { error } from "@sveltejs/kit";
import { z } from "zod";

import { mapMatchDetail } from "$lib/fotmob/match-analysis";
import { mapMatchFactsEvents } from "$lib/fotmob/match-playbyplay";
import { fetchFotmobOptional, getMatchDetails } from "$lib/server/fotmob";

import type { RequestHandler } from "./$types";

const matchIdSchema = z.coerce.number().int().positive();

export const GET: RequestHandler = async ({ params, locals, setHeaders }) => {
  const parsed = matchIdSchema.safeParse(params.matchId);
  if (!parsed.success) {
    error(404, "Match not found");
  }

  setHeaders({
    "cache-control": "private, no-cache, no-store, must-revalidate",
  });

  try {
    const [details, playerStats] = await Promise.all([
      getMatchDetails(parsed.data),
      fetchFotmobOptional<Record<string, unknown>>(
        `/matches/${parsed.data}/player-stats`,
      ),
    ]);

    const match = mapMatchDetail(details, playerStats, locals.locale);
    const matchFacts = mapMatchFactsEvents(details);

    return Response.json({ match, matchFacts });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "FotMob API unavailable";
    error(503, message);
  }
};