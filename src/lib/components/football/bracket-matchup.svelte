<script lang="ts">
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import type { KnockoutMatchupView } from "$lib/fotmob/types";
  import { cn } from "$lib/utils";

  type Props = {
    matchup: KnockoutMatchupView;
    locale: "id" | "en";
    compact?: boolean;
    linkable?: boolean;
  };

  let { matchup, locale, compact = false, linkable = true }: Props = $props();

  const matchHref = $derived(
    matchup.matchId ? `/football/world-cup/match/${matchup.matchId}` : null,
  );

  const winnerClass = (teamId: number | undefined, winnerId?: number): string => {
    if (!teamId || !winnerId) {
      return "";
    }
    return teamId === winnerId ? "text-[var(--ring)] font-bold" : "opacity-55";
  };
</script>

<svelte:element
  this={linkable && matchHref ? "a" : "article"}
  href={linkable && matchHref ? matchHref : undefined}
  class={cn(
    "pixel-border bg-card block w-full no-underline",
    compact ? "p-1.5" : "p-3",
    matchup.isLive && "border-[var(--destructive)]",
    linkable && matchHref && "hover:border-[var(--ring)] transition-colors",
  )}
>
  {#if !compact}
    <div class="mb-2 flex items-center justify-between gap-2">
      <span class="font-pixel text-muted-foreground text-[8px] uppercase">
        {#if matchup.isLive}
          <span class="text-[var(--destructive)]">● LIVE</span>
        {:else if matchup.statusLabel}
          {matchup.statusLabel}
        {:else if matchup.isTbd}
          {locale === "id" ? "Menunggu" : "TBD"}
        {/if}
      </span>
      <span class="font-pixel text-[10px]">{matchup.score}</span>
    </div>
  {/if}

  <div class={cn("space-y-1", compact && "space-y-0.5")}>
    {#each [{ side: "home" as const }, { side: "away" as const }] as row (row.side)}
      {@const isHome = row.side === "home"}
      {@const name = isHome ? matchup.homeName : matchup.awayName}
      {@const short = isHome ? matchup.homeShort : matchup.awayShort}
      {@const teamId = isHome ? matchup.homeTeamId : matchup.awayTeamId}
      <div
        class={cn(
          "flex items-center gap-1.5",
          compact ? "min-h-[1.25rem]" : "min-h-[1.5rem]",
          winnerClass(teamId, matchup.winnerTeamId),
        )}
      >
        {#if teamId}
          <img
            src={FOTMOB_TEAM_LOGO(teamId)}
            alt=""
            width="16"
            height="16"
            class={cn(
              "shrink-0 image-rendering-pixelated",
              compact ? "size-4" : "size-5",
            )}
            loading="lazy"
          />
        {/if}
        <span
          class={cn(
            "font-retro min-w-0 flex-1 truncate",
            compact ? "text-[11px] leading-tight" : "text-sm",
          )}
          title={name}
        >
          {name}
        </span>
        {#if compact}
          <span class="font-pixel text-[8px] tabular-nums">{short}</span>
        {:else}
          <span class="font-pixel text-muted-foreground text-[8px]">{short}</span>
        {/if}
      </div>
    {/each}
  </div>

  {#if compact}
    <div class="mt-1 flex items-center justify-between gap-1 border-t-2 border-border pt-1">
      <span class="font-pixel text-muted-foreground text-[7px] uppercase">
        {#if matchup.isLive}
          <span class="text-[var(--destructive)]">LIVE</span>
        {:else}
          {matchup.statusLabel || matchup.score}
        {/if}
      </span>
      <span class="font-pixel text-[8px] tabular-nums">{matchup.score}</span>
    </div>
  {:else if matchHref}
    <p class="font-pixel text-[var(--ring)] mt-2 text-[7px] uppercase">
      {locale === "id" ? "Lihat analisa →" : "View analysis →"}
    </p>
  {/if}
</svelte:element>