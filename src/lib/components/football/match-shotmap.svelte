<script lang="ts">
  import type { MatchShotView } from "$lib/fotmob/types";

  type Props = {
    shots: MatchShotView[];
    homeTeamId: number;
    awayTeamId: number;
    homeName: string;
    awayName: string;
    locale: "id" | "en";
  };

  let { shots, homeTeamId, awayTeamId, homeName, awayName, locale }: Props =
    $props();
</script>

<section class="pixel-border bg-card p-4">
  <h2 class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide">
    {locale === "id" ? "Peta tembakan" : "Shot map"}
  </h2>
  {#if shots.length === 0}
    <p class="font-retro text-muted-foreground text-sm">
      {locale === "id" ? "Data tembakan belum tersedia." : "Shot data unavailable."}
    </p>
  {:else}
    <div class="overflow-x-auto">
      <svg
        viewBox="0 0 100 100"
        class="bg-muted/40 w-full min-w-[16rem] border-2 border-border"
        role="img"
        aria-label={locale === "id" ? "Peta tembakan" : "Shot map"}
      >
        <rect x="84" y="18" width="16" height="64" fill="none" class="stroke-border" stroke-width="1" />
        {#each shots as shot (shot.id)}
          {@const isHome = shot.teamId === homeTeamId}
          <circle
            cx={shot.x}
            cy={shot.y}
            r={shot.isGoal ? 2.2 : 1.6}
            class={shot.isGoal
              ? "fill-[var(--destructive)]"
              : isHome
                ? "fill-[var(--team-home)]"
                : "fill-[var(--team-away)]"}
            opacity={shot.isOnTarget ? 1 : 0.55}
          />
        {/each}
      </svg>
    </div>
    <p class="font-pixel text-muted-foreground mt-2 text-[7px] uppercase">
      <span class="text-[var(--team-home)]">●</span> {homeName}
      <span class="mx-2 text-[var(--team-away)]">●</span> {awayName}
      <span class="mx-2 text-[var(--destructive)]">●</span>
      {locale === "id" ? "Gol" : "Goal"}
    </p>
  {/if}
</section>