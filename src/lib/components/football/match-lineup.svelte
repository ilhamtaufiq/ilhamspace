<script lang="ts">
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import type { MatchLineupView } from "$lib/fotmob/types";

  type Props = {
    lineup: MatchLineupView;
    locale: "id" | "en";
  };

  let { lineup, locale }: Props = $props();
</script>

<article class="pixel-border bg-card p-4">
  <div class="mb-3 flex items-center gap-2">
    <img
      src={FOTMOB_TEAM_LOGO(lineup.teamId)}
      alt=""
      width="24"
      height="24"
      class="size-6 image-rendering-pixelated"
    />
    <div>
      <h3 class="font-pixel text-[10px] uppercase">{lineup.teamName}</h3>
      <p class="font-pixel text-muted-foreground text-[8px]">
        {lineup.formation}
      </p>
    </div>
  </div>

  <p class="font-pixel text-muted-foreground mb-2 text-[7px] uppercase">
    {locale === "id" ? "Starter" : "Starters"}
  </p>
  <ul class="space-y-1">
    {#each lineup.starters as player (player.id)}
      <li class="flex items-center justify-between gap-2">
        <span class="font-retro text-sm">
          <span class="font-pixel text-muted-foreground text-[8px]">
            {player.shirtNumber}
          </span>
          {player.shortName}
        </span>
        {#if player.rating}
          <span class="font-pixel text-[8px] tabular-nums">{player.rating.toFixed(1)}</span>
        {/if}
      </li>
    {/each}
  </ul>

  {#if lineup.subs.length > 0}
    <p class="font-pixel text-muted-foreground mt-4 mb-2 text-[7px] uppercase">
      {locale === "id" ? "Cadangan" : "Substitutes"}
    </p>
    <ul class="space-y-1">
      {#each lineup.subs as player (player.id)}
        <li class="flex items-center justify-between gap-2 opacity-80">
          <span class="font-retro text-xs">
            <span class="font-pixel text-muted-foreground text-[8px]">
              {player.shirtNumber}
            </span>
            {player.shortName}
          </span>
          {#if player.rating}
            <span class="font-pixel text-[8px] tabular-nums">{player.rating.toFixed(1)}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</article>