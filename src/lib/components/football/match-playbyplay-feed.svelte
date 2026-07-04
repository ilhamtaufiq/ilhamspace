<script lang="ts">
  import { onMount } from "svelte";

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
  };

  const KIND_ICONS: Partial<Record<MatchPlayByPlayKind, string>> = {
    goal: "⚽",
    assist: "🅰",
    card: "🟨",
    substitution: "🔄",
    half: "⏱",
    added_time: "⏳",
    injury: "🏥",
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

  const entryIcon = (entry: MatchPlayByPlayEntry): string => {
    if (
      entry.kind === "card" &&
      entry.description?.toLowerCase().includes("red")
    ) {
      return "🟥";
    }
    return KIND_ICONS[entry.kind] ?? "•";
  };

  const pillLabel = (entry: MatchPlayByPlayEntry): string => {
    const label = kindLabel(entry.kind);
    if (entry.playerName) {
      return `${label} ${entry.playerName}`;
    }
    return entry.title ?? label;
  };

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
    }, 30_000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

{#if playByPlay.hasData}
  <section class="pixel-border bg-card mb-6 p-4">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="font-pixel text-primary text-[10px] uppercase tracking-wide">
        {t("football.playByPlayTitle")}
      </h2>
      {#if isLive}
        <span
          class="font-pixel text-[7px] uppercase text-[var(--destructive)]"
        >
          {t("football.playByPlayLive")}
        </span>
      {/if}
    </div>

    <ul class="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
      {#each entries as entry (entry.id)}
        <li
          class={cn(
            "pixel-border flex items-start gap-2 bg-muted/20 p-2 transition-colors",
            entry.isHighlight && "border-[var(--ring)]",
            freshIds.has(entry.id) && "bg-[var(--ring)]/10",
          )}
        >
          <span class="mt-0.5 shrink-0 text-sm" aria-hidden="true">
            {entryIcon(entry)}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              {#if entry.minute}
                <span class="font-pixel text-[8px] tabular-nums uppercase">
                  {entry.minute}
                </span>
              {/if}
              <span
                class={cn(
                  "font-pixel inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[8px] uppercase",
                  entry.team === "home" && "bg-[var(--team-home)]/15",
                  entry.team === "away" && "bg-[var(--team-away)]/20",
                  !entry.team && "bg-card",
                )}
              >
                {pillLabel(entry)}
              </span>
            </div>
            {#if entry.description && entry.kind !== "card"}
              <p class="font-retro text-muted-foreground mt-1 text-[11px] leading-snug">
                {entry.description}
              </p>
            {/if}
            {#if entry.scoreAfter}
              <p class="font-pixel mt-1 text-[7px] tabular-nums uppercase">
                {entry.scoreAfter}
              </p>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}