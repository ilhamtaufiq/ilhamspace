import { fail, error } from "@sveltejs/kit";
import { z } from "zod";

import { checkRateLimit } from "$lib/auth/rate-limit";
import {
  createMatchChatMessage,
  getMatchChatMessages,
} from "$lib/db/match-chat";
import { mapMatchDetail } from "$lib/fotmob/match-analysis";
import { mapMatchCommentary } from "$lib/fotmob/match-commentary";
import {
  mapMatchActionPlayByPlay,
  mapMatchFactsEvents,
} from "$lib/fotmob/match-playbyplay";
import { translate } from "$lib/i18n";
import { matchChatSchema } from "$lib/schemas/match-chat";
import { broadcastMatchChatMessage } from "$lib/server/broadcast-match-chat";
import {
  fetchFotmobOptional,
  getMatchComments,
  getMatchDetails,
} from "$lib/server/fotmob";

import type { Actions, PageServerLoad } from "./$types";

const matchIdSchema = z.coerce.number().int().positive();

export const load: PageServerLoad = async ({ params, locals, setHeaders }) => {
  const parsed = matchIdSchema.safeParse(params.matchId);
  if (!parsed.success) {
    error(404, "Match not found");
  }

  const matchId = parsed.data;
  setHeaders({
    "cache-control": "public, max-age=120, stale-while-revalidate=300",
  });

  try {
    const [details, playerStats, chatMessages, commentsRaw] =
      await Promise.all([
        getMatchDetails(matchId),
        fetchFotmobOptional<Record<string, unknown>>(
          `/matches/${matchId}/player-stats`,
        ),
        getMatchChatMessages(matchId),
        getMatchComments(matchId),
      ]);

    const match = mapMatchDetail(details, playerStats, locals.locale);
    const commentary = mapMatchCommentary(commentsRaw);
    const matchFacts = mapMatchFactsEvents(details);
    const playByPlay = mapMatchActionPlayByPlay(details, commentsRaw);

    return {
      match,
      commentary,
      matchFacts,
      playByPlay,
      chatMessages: match.isFinished ? [] : chatMessages,
      chatEnabled: !match.isFinished,
      error: null as string | null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "FotMob API unavailable";
    error(503, message);
  }
};

export const actions: Actions = {
  chat: async (event) => {
    const parsedId = matchIdSchema.safeParse(event.params.matchId);
    if (!parsedId.success) {
      error(404, "Match not found");
    }

    const matchId = parsedId.data;
    const locale = event.locals.locale;

    let matchFinished = true;
    try {
      const details = await getMatchDetails(matchId);
      const match = mapMatchDetail(details, null, locale);
      matchFinished = match.isFinished;
    } catch {
      return fail(503, {
        chatError: translate(locale, "football.liveChatErrorUnavailable"),
        authorName: "",
      });
    }

    if (matchFinished) {
      return fail(403, {
        chatError: translate(locale, "football.liveChatErrorClosed"),
        authorName: "",
      });
    }

    const clientIp = event.getClientAddress();
    if (!checkRateLimit(`match-chat:${clientIp}`, 40, 15 * 60 * 1000)) {
      return fail(429, {
        chatError: translate(locale, "football.liveChatErrorRateLimit"),
        authorName: "",
      });
    }

    const formData = await event.request.formData();
    const raw = {
      authorName: String(formData.get("authorName") ?? ""),
      body: String(formData.get("body") ?? ""),
    };

    const parsed = matchChatSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        chatError: translate(locale, "football.liveChatErrorInvalid"),
        authorName: raw.authorName,
      });
    }

    const message = await createMatchChatMessage({
      matchId,
      authorName: parsed.data.authorName,
      body: parsed.data.body,
    });

    broadcastMatchChatMessage(matchId, message);

    return {
      chatSent: true as const,
      message,
      authorName: parsed.data.authorName,
    };
  },
};