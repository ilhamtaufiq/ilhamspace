<script lang="ts">
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import type { MatchPlayerRating } from "$lib/fotmob/types";

  type Props = {
    players: MatchPlayerRating[];
    locale: "id" | "en";
    limit?: number;
  };

  let { players, locale, limit = 10 }: Props = $props();
  const shown = $derived(players.slice(0, limit));
</script>

<section class="pixel-border bg-card p-4">
  <h2 class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide">
    {locale === "id" ? "Rating pemain" : "Player ratings"}
  </h2>
  {#if shown.length === 0}
    <p class="font-retro text-muted-foreground text-sm">
      {locale === "id" ? "Data pemain belum tersedia." : "Player data unavailable."}
    </p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full min-w-[20rem] text-left">
        <thead>
          <tr class="font-pixel text-muted-foreground border-b-2 border-border text-[7px] uppercase">
            <th class="pb-2 pr-2">#</th>
            <th class="pb-2 pr-2">{locale === "id" ? "Pemain" : "Player"}</th>
            <th class="pb-2 pr-2 text-center">G</th>
            <th class="pb-2 pr-2 text-center">A</th>
            <th class="pb-2 pr-2 text-center">xG</th>
            <th class="pb-2 text-right">{locale === "id" ? "Rating" : "Rating"}</th>
          </tr>
        </thead>
        <tbody>
          {#each shown as player, index (player.id)}
            <tr class="border-b border-border/60 last:border-0">
              <td class="font-pixel py-2 pr-2 text-[8px] tabular-nums">{index + 1}</td>
              <td class="py-2 pr-2">
                <div class="flex items-center gap-2">
                  <img
                    src={FOTMOB_TEAM_LOGO(player.teamId)}
                    alt=""
                    width="16"
                    height="16"
                    class="size-4 image-rendering-pixelated"
                  />
                  <div class="min-w-0">
                    <p class="font-retro truncate text-sm">{player.name}</p>
                    <p class="font-pixel text-muted-foreground text-[7px]">
                      {player.teamName} · {player.shirtNumber}
                    </p>
                  </div>
                </div>
              </td>
              <td class="font-pixel py-2 pr-2 text-center text-[8px]">{player.goals}</td>
              <td class="font-pixel py-2 pr-2 text-center text-[8px]">{player.assists}</td>
              <td class="font-pixel py-2 pr-2 text-center text-[8px]">
                {player.xg > 0 ? player.xg.toFixed(2) : "—"}
              </td>
              <td class="font-pixel py-2 text-right text-[9px] font-bold text-[var(--ring)]">
                {player.rating.toFixed(1)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>