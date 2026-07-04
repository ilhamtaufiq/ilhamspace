<script lang="ts">
  import MatchPlayByPlayPopup from "$lib/components/football/match-playbyplay-popup.svelte";
  import MatchPlayerDetailPopup from "$lib/components/football/match-player-detail-popup.svelte";
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import type {
    MatchLineupPlayer,
    MatchLineupView,
    MatchPlayByPlayView,
    MatchPlayerDetail,
    MatchPlayerStatsIndex,
  } from "$lib/fotmob/types";
  import { cn } from "$lib/utils";

  type Props = {
    home?: MatchLineupView;
    away?: MatchLineupView;
    locale: "id" | "en";
    matchId?: number;
    matchFacts?: MatchPlayByPlayView;
    playerStatsById?: MatchPlayerStatsIndex;
    isLive?: boolean;
  };

  let {
    home,
    away,
    locale,
    matchId = 0,
    matchFacts = { entries: [], hasData: false },
    playerStatsById = {},
    isLive = false,
  }: Props = $props();

  let selectedPlayer = $state<MatchPlayerDetail | null>(null);

  const hasLineup = $derived(
    (home?.starters.length ?? 0) > 0 || (away?.starters.length ?? 0) > 0,
  );

  const ratingClass = (rating: number | undefined): string => {
    if (rating === undefined) {
      return "bg-muted text-muted-foreground";
    }
    if (rating >= 8) {
      return "bg-[var(--ring)] text-[var(--background)]";
    }
    if (rating >= 7) {
      return "bg-accent text-[var(--accent-foreground)]";
    }
    return "bg-muted text-foreground";
  };

  const openPlayer = (player: MatchLineupPlayer, lineup: MatchLineupView): void => {
    const detail = playerStatsById[player.id];
    selectedPlayer = detail ?? {
      id: player.id,
      name: player.name,
      teamId: lineup.teamId,
      teamName: lineup.teamName,
      shirtNumber: player.shirtNumber,
      groups: [],
      hasStats: false,
    };
  };

  const closePlayer = (): void => {
    selectedPlayer = null;
  };
</script>

{#snippet playerNode(
  player: MatchLineupPlayer,
  lineup: MatchLineupView,
  teamColor: string | undefined,
)}
  <button
    type="button"
    class="absolute z-10 flex w-[3.25rem] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center border-0 bg-transparent p-0 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] sm:w-[3.75rem]"
    style="left: {player.pitchX}%; top: {player.pitchY}%"
    aria-label={player.name}
    onclick={() => openPlayer(player, lineup)}
  >
    <div
      class="pixel-border flex size-8 flex-col items-center justify-center bg-card shadow-sm sm:size-9"
      style={teamColor ? `border-color: ${teamColor}` : undefined}
    >
      <span class="font-pixel text-[9px] leading-none sm:text-[10px]">
        {player.shirtNumber}
      </span>
    </div>
    <span
      class="font-retro mt-0.5 max-w-full truncate text-center text-[9px] leading-tight sm:text-[10px]"
    >
      {player.shortName}
    </span>
    {#if player.rating !== undefined}
      <span
        class={cn(
          "font-pixel mt-0.5 px-1 text-[7px] tabular-nums",
          ratingClass(player.rating),
        )}
      >
        {player.rating.toFixed(1)}
      </span>
    {/if}
  </button>
{/snippet}

{#if hasLineup}
  <section class="pixel-border bg-card mb-6 p-4">
    <h2 class="font-pixel text-primary mb-4 text-[10px] uppercase tracking-wide">
      {locale === "id" ? "Formasi pemain" : "Player formation"}
    </h2>

    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      {#if home}
        <div class="flex items-center gap-2">
          <img
            src={FOTMOB_TEAM_LOGO(home.teamId)}
            alt=""
            width="20"
            height="20"
            class="size-5 image-rendering-pixelated"
          />
          <div>
            <p class="font-pixel text-[8px] uppercase">{home.teamName}</p>
            <p class="font-pixel text-muted-foreground text-[7px]">
              {home.formation}
            </p>
          </div>
        </div>
      {/if}
      {#if away}
        <div class="flex items-center gap-2 sm:flex-row-reverse sm:text-right">
          <img
            src={FOTMOB_TEAM_LOGO(away.teamId)}
            alt=""
            width="20"
            height="20"
            class="size-5 image-rendering-pixelated"
          />
          <div>
            <p class="font-pixel text-[8px] uppercase">{away.teamName}</p>
            <p class="font-pixel text-muted-foreground text-[7px]">
              {away.formation}
            </p>
          </div>
        </div>
      {/if}
    </div>

    <div
      class="relative mx-auto aspect-[68/105] w-full max-w-md overflow-hidden border-2 border-border bg-[#2a5c34]"
      role="img"
      aria-label={locale === "id" ? "Diagram formasi" : "Formation diagram"}
    >
      <div
        class="pointer-events-none absolute inset-[3%] border-2 border-white/35"
      ></div>
      <div
        class="pointer-events-none absolute top-1/2 right-[3%] left-[3%] h-0 border-t-2 border-white/35"
      ></div>
      <div
        class="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35"
      ></div>
      <div
        class="pointer-events-none absolute top-[3%] right-[22%] left-[22%] h-[14%] border-2 border-white/35"
      ></div>
      <div
        class="pointer-events-none absolute bottom-[3%] right-[22%] left-[22%] h-[14%] border-2 border-white/35"
      ></div>

      {#if home}
        {#each home.starters as player (player.id)}
          {@render playerNode(player, home, home.teamColor)}
        {/each}
      {/if}
      {#if away}
        {#each away.starters as player (player.id)}
          {@render playerNode(player, away, away.teamColor)}
        {/each}
      {/if}

      {#if matchFacts.hasData && matchId > 0}
        <MatchPlayByPlayPopup {matchId} playByPlay={matchFacts} {isLive} />
      {/if}
    </div>

    <p class="font-pixel text-muted-foreground mt-3 text-[7px] uppercase">
      {locale === "id"
        ? "Ketuk pemain untuk melihat statistik"
        : "Tap a player to view stats"}
    </p>
  </section>
{/if}

{#if selectedPlayer}
  <MatchPlayerDetailPopup player={selectedPlayer} onClose={closePlayer} />
{/if}