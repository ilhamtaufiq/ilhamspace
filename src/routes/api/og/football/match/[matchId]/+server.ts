import { error } from "@sveltejs/kit";
import { z } from "zod";

import { mapMatchDetail } from "$lib/fotmob/match-analysis";
import { renderMatchOgImage } from "$lib/server/og/match-score-card";
import { getMatchDetails } from "$lib/server/fotmob";

import type { RequestHandler } from "./$types";

const matchIdSchema = z.coerce.number().int().positive();

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const parsed = matchIdSchema.safeParse(params.matchId);
  if (!parsed.success) {
    error(404, "Match not found");
  }

  let details: Record<string, unknown>;
  try {
    details = await getMatchDetails(parsed.data);
  } catch {
    error(503, "Match data unavailable");
  }

  const match = mapMatchDetail(details, null, "en");
  const png = await renderMatchOgImage({
    homeName: match.home.name,
    awayName: match.away.name,
    homeScore: match.home.score,
    awayScore: match.away.score,
    homeTeamId: match.home.id,
    awayTeamId: match.away.id,
    statusLabel: match.statusLong || match.statusShort,
    roundLabel: match.roundLabel,
    isLive: match.isLive,
  });

  setHeaders({
    "content-type": "image/png",
    "cache-control": "public, max-age=120, stale-while-revalidate=300",
  });

  return new Response(new Uint8Array(png), { status: 200 });
};