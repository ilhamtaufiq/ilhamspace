<script lang="ts">
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import type {
    MatchEventView,
    MatchPlayByPlayEntry,
    MatchPlayByPlayKind,
    MatchPlayByPlayView,
  } from "$lib/fotmob/types";
  import type { MessageKey } from "$lib/i18n";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  type TimelineEntry = {
    id: string;
    minute: string;
    kind: MatchPlayByPlayKind;
    team?: "home" | "away";
    playerName?: string;
    detail?: string;
    scoreAfter?: string;
    sortKey: number;
  };

  type Props = {
    playByPlay: MatchPlayByPlayView;
    events?: MatchEventView[];
    homeName: string;
    awayName: string;
    homeTeamId: number;
    awayTeamId: number;
  };

  let {
    playByPlay,
    events = [],
    homeName,
    awayName,
    homeTeamId,
    awayTeamId,
  }: Props = $props();

  const { t } = getLocaleContext();

  const TIMELINE_KINDS = new Set<MatchPlayByPlayKind>([
    "goal",
    "card",
    "substitution",
    "half",
    "added_time",
    "injury",
  ]);

  const KIND_LABEL_KEYS: Partial<Record<MatchPlayByPlayKind, MessageKey>> = {
    goal: "football.playByPlayKind.goal",
    card: "football.playByPlayKind.card",
    substitution: "football.playByPlayKind.substitution",
    half: "football.playByPlayKind.half",
    added_time: "football.playByPlayKind.addedTime",
    injury: "football.playByPlayKind.injury",
  };

  const kindLabel = (kind: MatchPlayByPlayKind): string => {
    const key = KIND_LABEL_KEYS[kind];
    return key ? t(key) : kind;
  };

  const entryIcon = (entry: TimelineEntry): string => {
    if (entry.kind === "goal") {
      return "⚽";
    }
    if (entry.kind === "substitution") {
      return "🔄";
    }
    if (entry.kind === "card") {
      return entry.detail?.toLowerCase().includes("red") ? "🟥" : "🟨";
    }
    if (entry.kind === "half") {
      return "⏱";
    }
    if (entry.kind === "added_time") {
      return "⏳";
    }
    if (entry.kind === "injury") {
      return "🏥";
    }
    return "•";
  };

  const fromPlayByPlay = (entry: MatchPlayByPlayEntry): TimelineEntry => ({
    id: entry.id,
    minute: entry.minute || "—",
    kind: entry.kind,
    team: entry.team,
    playerName: entry.playerName ?? entry.title,
    detail: entry.description,
    scoreAfter: entry.scoreAfter,
    sortKey: entry.sortKey,
  });

  const fromMatchEvent = (event: MatchEventView): TimelineEntry => ({
    id: event.id,
    minute: `${event.minute}'`,
    kind: event.type === "goal" ? "goal" : "card",
    team: event.team,
    playerName: event.playerName,
    detail: event.detail,
    scoreAfter: event.scoreAfter,
    sortKey: typeof event.minute === "number" ? event.minute * 100 : 0,
  });

  const timelineEntries = $derived.by((): TimelineEntry[] => {
    const fromFacts = playByPlay.entries
      .filter((entry) => TIMELINE_KINDS.has(entry.kind))
      .map(fromPlayByPlay);

    const source = fromFacts.length > 0 ? fromFacts : events.map(fromMatchEvent);

    return [...source].sort((a, b) => a.sortKey - b.sortKey);
  });

  const isNeutral = (entry: TimelineEntry): boolean =>
    entry.kind === "half" || entry.kind === "added_time" || !entry.team;

  const eventHeadline = (entry: TimelineEntry): string => {
    if (entry.kind === "substitution" && entry.detail) {
      return entry.detail;
    }
    if (entry.playerName) {
      return entry.playerName;
    }
    return entry.detail ?? kindLabel(entry.kind);
  };
</script>

{#if timelineEntries.length > 0}
  <section class="pixel-border bg-card mb-6 overflow-hidden">
    <header class="border-b-2 border-border bg-muted/30 px-4 py-3">
      <h2 class="font-pixel text-primary text-[10px] uppercase tracking-wide">
        {t("football.eventTimelineTitle")}
      </h2>
    </header>

    <div class="relative px-3 py-4 sm:px-4">
      <div
        class="absolute top-4 bottom-4 left-1/2 w-0.5 -translate-x-1/2 bg-border"
        aria-hidden="true"
      ></div>

      <ol class="relative space-y-3">
        {#each timelineEntries as entry (entry.id)}
          {#if isNeutral(entry)}
            <li class="relative flex justify-center py-1">
              <div
                class="pixel-border z-10 flex items-center gap-2 bg-muted/50 px-3 py-1.5"
              >
                <span aria-hidden="true">{entryIcon(entry)}</span>
                <span class="font-pixel text-[8px] uppercase text-foreground">
                  {entry.detail ?? entry.playerName ?? kindLabel(entry.kind)}
                </span>
                {#if entry.minute && entry.minute !== "—"}
                  <span
                    class="font-pixel text-muted-foreground text-[7px] tabular-nums"
                  >
                    {entry.minute}
                  </span>
                {/if}
              </div>
            </li>
          {:else}
            <li class="relative grid grid-cols-[1fr_auto_1fr] items-start gap-2">
              <div
                class={cn(
                  "min-w-0",
                  entry.team === "home" ? "text-right" : "invisible",
                )}
              >
                {#if entry.team === "home"}
                  <div
                    class="pixel-border inline-flex max-w-full flex-col items-end gap-1 bg-background px-2.5 py-2 text-right"
                  >
                    <div class="flex items-center justify-end gap-1.5">
                      <span class="font-retro text-sm leading-snug">
                        {eventHeadline(entry)}
                      </span>
                      <span class="shrink-0 text-base" aria-hidden="true">
                        {entryIcon(entry)}
                      </span>
                    </div>
                    {#if entry.detail && entry.kind !== "substitution"}
                      <p
                        class="font-pixel text-muted-foreground text-[7px] uppercase"
                      >
                        {entry.detail}
                      </p>
                    {/if}
                    {#if entry.scoreAfter}
                      <p class="font-pixel text-[8px] tabular-nums">
                        {entry.scoreAfter}
                      </p>
                    {/if}
                  </div>
                {/if}
              </div>

              <div class="z-10 flex flex-col items-center pt-1">
                <span
                  class="font-pixel bg-card pixel-border min-w-[2.5rem] px-1.5 py-0.5 text-center text-[8px] tabular-nums uppercase"
                >
                  {entry.minute}
                </span>
              </div>

              <div
                class={cn(
                  "min-w-0",
                  entry.team === "away" ? "text-left" : "invisible",
                )}
              >
                {#if entry.team === "away"}
                  <div
                    class="pixel-border inline-flex max-w-full flex-col items-start gap-1 bg-background px-2.5 py-2 text-left"
                  >
                    <div class="flex items-center gap-1.5">
                      <span class="shrink-0 text-base" aria-hidden="true">
                        {entryIcon(entry)}
                      </span>
                      <span class="font-retro text-sm leading-snug">
                        {eventHeadline(entry)}
                      </span>
                    </div>
                    {#if entry.detail && entry.kind !== "substitution"}
                      <p
                        class="font-pixel text-muted-foreground text-[7px] uppercase"
                      >
                        {entry.detail}
                      </p>
                    {/if}
                    {#if entry.scoreAfter}
                      <p class="font-pixel text-[8px] tabular-nums">
                        {entry.scoreAfter}
                      </p>
                    {/if}
                  </div>
                {/if}
              </div>
            </li>
          {/if}
        {/each}
      </ol>

      <div
        class="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3"
      >
        <div class="flex min-w-0 items-center gap-2">
          <img
            src={FOTMOB_TEAM_LOGO(homeTeamId)}
            alt=""
            width="20"
            height="20"
            class="size-5 shrink-0 image-rendering-pixelated"
          />
          <span class="font-pixel truncate text-[7px] uppercase">{homeName}</span>
        </div>
        <div class="flex min-w-0 items-center gap-2">
          <span class="font-pixel truncate text-[7px] uppercase">{awayName}</span>
          <img
            src={FOTMOB_TEAM_LOGO(awayTeamId)}
            alt=""
            width="20"
            height="20"
            class="size-5 shrink-0 image-rendering-pixelated"
          />
        </div>
      </div>
    </div>
  </section>
{/if}