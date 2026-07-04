import { error } from "@sveltejs/kit";
import { z } from "zod";

import { mapMatchDetail } from "$lib/fotmob/match-analysis";
import {
  buildMatchOgStatusLabel,
  buildMatchOgTimeLabel,
} from "$lib/server/og/match-score-card";
import {
  buildMatchStoryCardInput,
  renderMatchStoryImage,
} from "$lib/server/og/match-story-card";
import { fetchFotmobOptional, getMatchDetails } from "$lib/server/fotmob";

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

  const playerStats = await fetchFotmobOptional<Record<string, unknown>>(
    `/matches/${parsed.data}/player-stats`,
  );

  const match = mapMatchDetail(details, playerStats, "en");
  const storyInput = buildMatchStoryCardInput(match, {
    timeLabel: buildMatchOgTimeLabel({
      isLive: match.isLive,
      isFinished: match.isFinished,
      matchMinute: match.matchMinute,
      statusShort: match.statusShort,
    }),
    statusLabel: buildMatchOgStatusLabel({
      statusLong: match.statusLong,
      statusShort: match.statusShort,
      isLive: match.isLive,
      isFinished: match.isFinished,
    }),
  });

  const png = await renderMatchStoryImage(storyInput);

  setHeaders({
    "content-type": "image/png",
    "content-disposition": `inline; filename="ilhamspace-match-${parsed.data}-story.png"`,
    "cache-control": match.isLive
      ? "private, no-cache, no-store, must-revalidate"
      : "public, max-age=86400, immutable",
  });

  return new Response(new Uint8Array(png), { status: 200 });
};