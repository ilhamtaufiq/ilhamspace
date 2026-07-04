import { WORLD_CUP_LEAGUE_ID } from "$lib/fotmob/constants";
import { mapPlayoffToBracket } from "$lib/fotmob/world-cup";
import { getLeaguePlayoff } from "$lib/server/fotmob";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  setHeaders({
    "cache-control": "public, max-age=300, stale-while-revalidate=600",
  });

  try {
    const playoff = await getLeaguePlayoff(WORLD_CUP_LEAGUE_ID);
    const locale = locals.locale;

    return {
      error: null as string | null,
      leagueName: playoff.leagueName ?? "FIFA World Cup",
      season: playoff.season,
      rounds: mapPlayoffToBracket(playoff, locale),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "FotMob API unavailable";
    return {
      error: message,
      leagueName: "FIFA World Cup",
      season: null as string | null,
      rounds: [],
    };
  }
};