<script lang="ts">
  import BracketMatchup from "$lib/components/football/bracket-matchup.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { BRACKET_SLOT_HEIGHT } from "$lib/fotmob/world-cup";
  import type { KnockoutRoundView } from "$lib/fotmob/types";
  import { cn } from "$lib/utils";

  type Props = {
    rounds: KnockoutRoundView[];
    locale: "id" | "en";
  };

  let { rounds, locale }: Props = $props();

  let selectedStage = $state("");
  let columnRefs: Record<string, HTMLDivElement | undefined> = $state({});

  const activeStage = $derived(selectedStage || rounds[0]?.stage || "");
  const firstRoundCount = $derived(rounds[0]?.matchups.length ?? 1);
  const bracketHeight = $derived(firstRoundCount * BRACKET_SLOT_HEIGHT);
  const ROUND_HEADER_HEIGHT = 24;

  const getMatchTop = (roundIndex: number, matchIndex: number): number => {
    const blockHeight = BRACKET_SLOT_HEIGHT * 2 ** roundIndex;
    return matchIndex * blockHeight + (blockHeight - BRACKET_SLOT_HEIGHT) / 2;
  };

  const selectedRound = $derived(
    rounds.find((round) => round.stage === activeStage) ?? rounds[0],
  );

  const selectRound = (stage: string): void => {
    selectedStage = stage;
    columnRefs[stage]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const columnRef = (
    node: HTMLDivElement,
    stage: string,
  ): { destroy: () => void } => {
    columnRefs[stage] = node;
    return {
      destroy: () => {
        delete columnRefs[stage];
      },
    };
  };
</script>

<div class="space-y-6">
  <div>
    <p class="font-pixel text-muted-foreground mb-2 text-[8px] uppercase">
      {locale === "id" ? "Bagan knockout" : "Knockout bracket"}
    </p>
    <div
      class="pixel-border bg-muted/30 flex flex-wrap gap-1 p-1.5"
      role="tablist"
      aria-label={locale === "id" ? "Pilih babak" : "Select round"}
    >
      {#each rounds as round (round.stage)}
        {@const active = round.stage === activeStage}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          role="tab"
          aria-selected={active}
          class={cn("font-pixel text-[8px] uppercase", active && "pixel-nav-active")}
          onclick={() => selectRound(round.stage)}
        >
          {round.label}
        </Button>
      {/each}
    </div>
  </div>

  <div class="pixel-border bg-muted/20 overflow-x-auto p-3">
    <div class="flex min-w-max items-stretch">
      {#each rounds as round, roundIndex (round.stage)}
        {@const active = round.stage === activeStage}
        {#if roundIndex > 0}
          {@const pairCount = Math.floor(
            rounds[roundIndex - 1].matchups.length / 2,
          )}
          <div class="flex w-6 shrink-0 flex-col" aria-hidden="true">
            <div style="height: {ROUND_HEADER_HEIGHT}px"></div>
            <div
              class="relative shrink-0"
              style="height: {bracketHeight}px"
            >
              {#each Array(pairCount) as _, pairIndex (pairIndex)}
                {@const top =
                  getMatchTop(roundIndex - 1, pairIndex * 2) +
                  BRACKET_SLOT_HEIGHT / 2}
                {@const bottom =
                  getMatchTop(roundIndex - 1, pairIndex * 2 + 1) +
                  BRACKET_SLOT_HEIGHT / 2}
                {@const mid = (top + bottom) / 2}
                <div
                  class="border-border pointer-events-none absolute right-0 left-0"
                  style="top: {top}px; height: {bottom - top}px"
                >
                  <div
                    class="border-border absolute top-0 left-0 w-1/2 border-t-2"
                  ></div>
                  <div
                    class="border-border absolute top-full left-0 w-1/2 border-t-2"
                  ></div>
                  <div
                    class="border-border absolute top-0 left-1/2 h-full border-l-2"
                  ></div>
                  <div
                    class="border-border absolute top-1/2 right-0 left-1/2 border-t-2"
                    style="top: {mid - top}px"
                  ></div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div
          class="flex w-[10.5rem] shrink-0 flex-col"
          use:columnRef={round.stage}
        >
          <h3
            class={cn(
              "font-pixel mb-2 text-center text-[8px] uppercase",
              active ? "text-[var(--ring)]" : "text-muted-foreground",
            )}
            style="min-height: {ROUND_HEADER_HEIGHT - 8}px"
          >
            {round.label}
          </h3>

          <div
            class={cn(
              "relative transition-shadow duration-200",
              active &&
                "rounded-none ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--background)]",
              !active && "opacity-75",
            )}
            style="height: {bracketHeight}px"
            role="tabpanel"
            aria-label={round.label}
          >
            {#each round.matchups as matchup, matchIndex (matchup.id)}
              <div
                class="absolute right-0 left-0 px-0.5"
                style="top: {getMatchTop(roundIndex, matchIndex)}px; height: {BRACKET_SLOT_HEIGHT}px"
              >
                <BracketMatchup {matchup} {locale} compact />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  {#if selectedRound}
    <section aria-labelledby="round-detail-heading">
      <h2
        id="round-detail-heading"
        class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide"
      >
        {selectedRound.label}
        <span class="text-muted-foreground font-normal">
          — {locale === "id" ? "detail pertandingan" : "match details"}
        </span>
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each selectedRound.matchups as matchup (matchup.id)}
          <BracketMatchup {matchup} {locale} />
        {/each}
      </div>
    </section>
  {/if}
</div>