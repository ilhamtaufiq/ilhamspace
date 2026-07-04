<script lang="ts">
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import type { KnockoutRoundView } from "$lib/fotmob/types";
  import { cn } from "$lib/utils";

  type Props = {
    rounds: KnockoutRoundView[];
    locale: "id" | "en";
  };

  let { rounds, locale }: Props = $props();

  const winnerClass = (teamId: number | undefined, winnerId?: number): string => {
    if (!teamId || !winnerId) {
      return "";
    }
    return teamId === winnerId ? "text-[var(--ring)] font-bold" : "opacity-60";
  };
</script>

<div class="space-y-8">
  {#each rounds as round (round.stage)}
    <section aria-labelledby={`round-${round.stage}`}>
      <h2
        id={`round-${round.stage}`}
        class="font-pixel text-accent mb-3 text-[10px] uppercase tracking-wide"
      >
        {round.label}
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each round.matchups as matchup (matchup.id)}
          <article
            class={cn(
              "pixel-border bg-card p-3",
              matchup.isLive && "border-[var(--destructive)]",
            )}
          >
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

            <div class="space-y-2">
              <div
                class={cn(
                  "flex items-center gap-2",
                  winnerClass(matchup.homeTeamId, matchup.winnerTeamId),
                )}
              >
                {#if matchup.homeTeamId}
                  <img
                    src={FOTMOB_TEAM_LOGO(matchup.homeTeamId)}
                    alt=""
                    width="20"
                    height="20"
                    class="size-5 shrink-0 image-rendering-pixelated"
                    loading="lazy"
                  />
                {/if}
                <span class="font-retro truncate text-sm">{matchup.homeName}</span>
                <span class="font-pixel text-muted-foreground ml-auto text-[8px]">
                  {matchup.homeShort}
                </span>
              </div>
              <div
                class={cn(
                  "flex items-center gap-2",
                  winnerClass(matchup.awayTeamId, matchup.winnerTeamId),
                )}
              >
                {#if matchup.awayTeamId}
                  <img
                    src={FOTMOB_TEAM_LOGO(matchup.awayTeamId)}
                    alt=""
                    width="20"
                    height="20"
                    class="size-5 shrink-0 image-rendering-pixelated"
                    loading="lazy"
                  />
                {/if}
                <span class="font-retro truncate text-sm">{matchup.awayName}</span>
                <span class="font-pixel text-muted-foreground ml-auto text-[8px]">
                  {matchup.awayShort}
                </span>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>