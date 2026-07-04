<script lang="ts">
  import { onMount } from "svelte";

  import {
    PLAY_BY_PLAY_POLL_MS,
    livePollFetchInit,
  } from "$lib/football/poll-intervals";
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import type {
    MatchPlayByPlayEntry,
    MatchPlayByPlayKind,
    MatchPlayByPlayView,
  } from "$lib/fotmob/types";
  import type { MessageKey } from "$lib/i18n";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  type Props = {
    matchId: number;
    playByPlay: MatchPlayByPlayView;
    isLive: boolean;
    homeTeamId?: number;
    awayTeamId?: number;
  };

  let {
    matchId,
    playByPlay,
    isLive,
    homeTeamId = 0,
    awayTeamId = 0,
  }: Props = $props();

  const { t } = getLocaleContext();

  const KIND_LABEL_KEYS: Partial<Record<MatchPlayByPlayKind, MessageKey>> = {
    goal: "football.playByPlayKind.goal",
    assist: "football.playByPlayKind.assist",
    card: "football.playByPlayKind.card",
    substitution: "football.playByPlayKind.substitution",
    half: "football.playByPlayKind.half",
    added_time: "football.playByPlayKind.addedTime",
    injury: "football.playByPlayKind.injury",
    comment: "football.playByPlayKind.comment",
    summary: "football.playByPlayKind.summary",
  };

  let entries = $state<MatchPlayByPlayEntry[]>([]);
  let freshIds = $state(new Set<string>());
  let seenIdSet = new Set<string>();
  let entriesKey = "";
  let initialized = false;

  const kindLabel = (kind: MatchPlayByPlayKind): string => {
    const key = KIND_LABEL_KEYS[kind];
    return key ? t(key) : kind;
  };

  const entryHeadline = (entry: MatchPlayByPlayEntry): string => {
    if (entry.kind === "comment" || entry.kind === "summary") {
      const text = entry.description ?? entry.title ?? kindLabel(entry.kind);
      return text.length > 120 ? `${text.slice(0, 119)}…` : text;
    }
    return entry.playerName ?? entry.title ?? kindLabel(entry.kind);
  };

  const entrySubline = (entry: MatchPlayByPlayEntry): string | undefined => {
    if (entry.kind === "comment" || entry.kind === "summary") {
      return kindLabel(entry.kind);
    }
    if (entry.description && entry.playerName) {
      return entry.description;
    }
    if (entry.scoreAfter) {
      return entry.scoreAfter;
    }
    return entry.description;
  };

  const hasDisplayContent = (entry: MatchPlayByPlayEntry): boolean =>
    Boolean(entry.playerName || entry.title || entry.description);

  const teamIdForEntry = (entry: MatchPlayByPlayEntry): number => {
    if (entry.team === "home") {
      return homeTeamId;
    }
    if (entry.team === "away") {
      return awayTeamId;
    }
    return 0;
  };

  const cardEntries = $derived.by(() => {
    const visible = entries.filter(hasDisplayContent);
    if (visible.length === 0) {
      return [];
    }

    const latest = visible[0];
    const actionKinds = new Set<MatchPlayByPlayKind>([
      "goal",
      "assist",
      "card",
      "substitution",
      "half",
      "added_time",
      "injury",
    ]);
    const second =
      visible.find(
        (entry, index) =>
          index > 0 &&
          (actionKinds.has(entry.kind) || entry.isHighlight) &&
          entry.id !== latest.id,
      ) ?? visible[1];

    const stack = second && second.id !== latest.id ? [second, latest] : [latest];
    return stack;
  });

  const activeEntry = $derived(cardEntries[cardEntries.length - 1] ?? entries[0]);

  const ACTION_KINDS = new Set<MatchPlayByPlayKind>([
    "goal",
    "assist",
    "card",
    "substitution",
    "half",
    "added_time",
    "injury",
  ]);

  const timelineEntries = $derived(
    entries
      .filter(
        (entry) =>
          hasDisplayContent(entry) &&
          (ACTION_KINDS.has(entry.kind) || entry.isHighlight),
      )
      .slice(0, 16),
  );

  const pitchPath = $derived.by(() => {
    if (!activeEntry) {
      return "M 18 58 C 34 48, 52 42, 72 36 L 82 32";
    }

    if (activeEntry.team === "away") {
      return "M 82 58 C 66 48, 48 42, 28 36 L 18 32";
    }

    return "M 18 58 C 34 48, 52 42, 72 36 L 82 32";
  });

  const markerPosition = $derived(
    activeEntry?.team === "away"
      ? { x: 18, y: 32 }
      : { x: 82, y: 32 },
  );

  const entryIdsKey = (items: MatchPlayByPlayEntry[]): string =>
    items.map((entry) => entry.id).join("\0");

  const syncEntries = (
    next: MatchPlayByPlayEntry[],
    animateNew = true,
  ): void => {
    const nextKey = entryIdsKey(next);

    if (!initialized) {
      initialized = true;
      seenIdSet = new Set(next.map((entry) => entry.id));
      entriesKey = nextKey;
      entries = next;
      return;
    }

    if (nextKey === entriesKey) {
      return;
    }

    const newFresh = new Set<string>();
    if (animateNew) {
      for (const entry of next) {
        if (!seenIdSet.has(entry.id)) {
          newFresh.add(entry.id);
        }
      }
    }

    seenIdSet = new Set(next.map((entry) => entry.id));
    entriesKey = nextKey;
    entries = next;

    if (newFresh.size > 0) {
      freshIds = newFresh;
      setTimeout(() => {
        freshIds = new Set();
      }, 1200);
    }
  };

  $effect(() => {
    syncEntries(playByPlay.entries, false);
  });

  onMount(() => {
    if (!isLive) {
      return;
    }

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/football/matches/${matchId}/playbyplay`,
          livePollFetchInit,
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as MatchPlayByPlayView;
        if (!data.hasData) {
          return;
        }
        syncEntries(data.entries);
      } catch {
        /* ignore transient poll errors */
      }
    };

    const interval = setInterval(() => {
      void poll();
    }, PLAY_BY_PLAY_POLL_MS);

    return () => {
      clearInterval(interval);
    };
  });
</script>

{#if playByPlay.hasData}
  <section class="pixel-border bg-card mb-6 overflow-hidden">
    <header
      class="flex items-center justify-between gap-3 border-b-2 border-border bg-muted/30 px-4 py-3"
    >
      <h2 class="font-pixel text-primary text-[10px] uppercase tracking-wide">
        {t("football.playByPlayTitle")}
      </h2>
      {#if isLive}
        <span
          class="font-pixel inline-flex items-center gap-1.5 text-[7px] uppercase text-[var(--destructive)]"
        >
          <span
            class="size-1.5 shrink-0 animate-pulse rounded-full bg-[var(--destructive)]"
            aria-hidden="true"
          ></span>
          {t("football.playByPlayLive")}
        </span>
      {/if}
    </header>

    <div class="playbyplay-stage relative h-[22rem] overflow-hidden bg-[#0a0a0a]">
      {#if cardEntries.length > 0}
        <div
          class="pointer-events-none absolute inset-x-0 top-5 z-20 flex flex-col items-center gap-2 px-4"
        >
          {#each cardEntries as entry, index (entry.id)}
            {@const teamId = teamIdForEntry(entry)}
            <div
              class={cn(
                "playbyplay-card flex w-full max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md transition-all",
                index === cardEntries.length - 1
                  ? "scale-100 opacity-100"
                  : "scale-[0.94] opacity-80",
                freshIds.has(entry.id) && "border-[var(--ring)]/60",
              )}
            >
              {#if teamId > 0}
                <img
                  src={FOTMOB_TEAM_LOGO(teamId)}
                  alt=""
                  width="36"
                  height="36"
                  class="size-9 shrink-0 rounded-full border border-white/15 image-rendering-pixelated"
                />
              {:else}
                <span
                  class="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm"
                  aria-hidden="true"
                >
                  •
                </span>
              {/if}
              <div class="min-w-0">
                <p class="font-pixel text-[8px] uppercase text-white/70">
                  {kindLabel(entry.kind)}
                  {#if entry.minute}
                    <span class="ml-1 tabular-nums">{entry.minute}</span>
                  {/if}
                </p>
                <p
                  class={cn(
                    "font-retro text-base leading-tight text-white",
                    entry.kind === "comment" || entry.kind === "summary"
                      ? "line-clamp-3 text-sm"
                      : "truncate",
                  )}
                >
                  {entryHeadline(entry)}
                </p>
                {#if entrySubline(entry)}
                  <p class="font-pixel mt-0.5 truncate text-[7px] uppercase text-white/55">
                    {entrySubline(entry)}
                  </p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <div class="playbyplay-pitch-wrap absolute inset-x-0 bottom-0 h-[78%]">
        <div class="playbyplay-pitch relative mx-auto h-full w-[108%] max-w-none">
          <div class="playbyplay-grass absolute inset-0"></div>

          <svg
            viewBox="0 0 100 68"
            class="absolute inset-0 h-full w-full"
            role="img"
            aria-label={t("football.playByPlayTitle")}
          >
            <rect
              x="4"
              y="4"
              width="92"
              height="60"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="0.8"
            />
            <line
              x1="50"
              y1="4"
              x2="50"
              y2="64"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="0.8"
            />
            <circle
              cx="50"
              cy="34"
              r="8"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="0.8"
            />
            <rect
              x="4"
              y="20"
              width="14"
              height="28"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="0.8"
            />
            <rect
              x="82"
              y="20"
              width="14"
              height="28"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="0.8"
            />

            {#if activeEntry}
              <path
                d={pitchPath}
                fill="none"
                stroke="white"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                cx={markerPosition.x}
                cy={markerPosition.y}
                r="4.5"
                fill="#2dd4bf"
                stroke="white"
                stroke-width="1.2"
              />
              <text
                x={markerPosition.x}
                y={markerPosition.y + 1.2}
                text-anchor="middle"
                fill="#0a0a0a"
                font-size="4.5"
                font-weight="700"
              >
                {Math.min(entries.length, 9) || 1}
              </text>
              <circle
                cx={markerPosition.x + (activeEntry.team === "away" ? -6 : 6)}
                cy={markerPosition.y + 4}
                r="2.2"
                fill="white"
                stroke="#111"
                stroke-width="0.6"
              />
            {/if}
          </svg>
        </div>
      </div>
    </div>

    {#if timelineEntries.length > 0}
      <div
        class="border-t border-border bg-muted/20 px-3 py-2"
        aria-label={t("football.playByPlayEvents")}
      >
        <p class="font-pixel mb-2 text-[7px] uppercase text-muted-foreground">
          {timelineEntries.length}
          {t("football.playByPlayEvents")}
        </p>
        <ol class="max-h-40 space-y-1 overflow-y-auto">
          {#each timelineEntries as entry (entry.id)}
            <li
              class={cn(
                "flex items-start gap-2 rounded border border-transparent px-2 py-1.5",
                freshIds.has(entry.id) && "border-[var(--ring)]/40 bg-muted/40",
                entry.isHighlight && "bg-muted/30",
              )}
            >
              {#if entry.minute}
                <span
                  class="font-pixel shrink-0 pt-0.5 text-[7px] tabular-nums uppercase text-muted-foreground"
                >
                  {entry.minute}
                </span>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="font-pixel text-[7px] uppercase text-[var(--ring)]">
                  {kindLabel(entry.kind)}
                </p>
                <p class="font-retro truncate text-xs leading-snug">
                  {entryHeadline(entry)}
                </p>
              </div>
            </li>
          {/each}
        </ol>
      </div>
    {/if}
  </section>
{/if}

<style>
  .playbyplay-grass {
    background:
      linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.15) 0%,
        rgba(0, 0, 0, 0.45) 100%
      ),
      repeating-linear-gradient(
        90deg,
        #2f7d3b 0,
        #2f7d3b 12%,
        #358944 12%,
        #358944 24%
      );
  }

  .playbyplay-pitch-wrap {
    perspective: 900px;
    perspective-origin: 50% 100%;
  }

  .playbyplay-pitch {
    transform: rotateX(54deg);
    transform-origin: center bottom;
  }

  @media (prefers-reduced-motion: reduce) {
    .playbyplay-pitch {
      transform: none;
    }
  }
</style>