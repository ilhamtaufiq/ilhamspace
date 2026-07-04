<script lang="ts">
  import { onMount } from "svelte";

  import type {
    MatchPlayByPlayEntry,
    MatchPlayByPlayKind,
    MatchPlayByPlayView,
  } from "$lib/fotmob/types";
  import type { MessageKey } from "$lib/i18n";
  import {
    PLAY_BY_PLAY_POLL_MS,
    livePollFetchInit,
  } from "$lib/football/poll-intervals";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  type Props = {
    matchId: number;
    playByPlay: MatchPlayByPlayView;
    isLive: boolean;
  };

  let { matchId, playByPlay, isLive }: Props = $props();

  const { t } = getLocaleContext();

  const POPUP_VISIBLE_MS = 4500;
  const POPUP_EXIT_MS = 400;

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

  const KIND_ICONS: Record<MatchPlayByPlayKind, string> = {
    goal: "⚽",
    assist: "🅰",
    card: "🟨",
    substitution: "🔄",
    half: "⏱",
    added_time: "⏳",
    injury: "🏥",
    comment: "💬",
    summary: "📋",
    other: "•",
  };

  let seenIdSet = new Set<string>();
  let entriesKey = "";
  let initialized = false;
  let queue = $state<MatchPlayByPlayEntry[]>([]);
  let activePopup = $state<MatchPlayByPlayEntry | null>(null);
  let popupPhase = $state<"enter" | "visible" | "exit" | "idle">("idle");
  let processing = false;

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
    return KIND_ICONS[entry.kind];
  };

  const truncate = (text: string, max = 96): string => {
    const trimmed = text.trim();
    if (trimmed.length <= max) {
      return trimmed;
    }
    return `${trimmed.slice(0, max - 1)}…`;
  };

  const popupHeadline = (entry: MatchPlayByPlayEntry): string => {
    if (entry.kind === "comment" || entry.kind === "summary") {
      return truncate(entry.description ?? entry.title ?? kindLabel(entry.kind));
    }
    if (entry.title) {
      return entry.title;
    }
    return kindLabel(entry.kind);
  };

  const popupSubline = (entry: MatchPlayByPlayEntry): string | undefined => {
    if (entry.kind === "comment" || entry.kind === "summary") {
      return kindLabel(entry.kind);
    }
    if (entry.description) {
      return truncate(entry.description, 72);
    }
    if (entry.scoreAfter) {
      return entry.scoreAfter;
    }
    return undefined;
  };

  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const isMatchEvent = (entry: MatchPlayByPlayEntry): boolean =>
    entry.source === "facts" &&
    entry.kind !== "comment" &&
    entry.kind !== "summary";

  const entryIdsKey = (items: MatchPlayByPlayEntry[]): string =>
    items.map((entry) => entry.id).join("\0");

  const enqueueNew = (next: MatchPlayByPlayEntry[]): void => {
    const fresh = next.filter(
      (entry) => isMatchEvent(entry) && !seenIdSet.has(entry.id),
    );
    if (fresh.length === 0) {
      return;
    }
    for (const entry of fresh) {
      seenIdSet.add(entry.id);
    }
    queue = [...queue, ...fresh];
    void processQueue();
  };

  const processQueue = async (): Promise<void> => {
    if (processing || queue.length === 0) {
      return;
    }
    processing = true;

    while (queue.length > 0) {
      const entry = queue[0];
      queue = queue.slice(1);
      activePopup = entry;
      popupPhase = "enter";

      await sleep(50);
      popupPhase = "visible";
      await sleep(POPUP_VISIBLE_MS);
      popupPhase = "exit";
      await sleep(POPUP_EXIT_MS);
    }

    activePopup = null;
    popupPhase = "idle";
    processing = false;
  };

  const syncEntries = (next: MatchPlayByPlayEntry[], initial = false): void => {
    const nextKey = entryIdsKey(next);

    if (!initialized) {
      initialized = true;
      seenIdSet = new Set(next.map((entry) => entry.id));
      entriesKey = nextKey;
      const latestFact = next.find((entry) => isMatchEvent(entry));
      if (initial && latestFact) {
        queue = [latestFact];
        void processQueue();
      }
      return;
    }

    if (nextKey === entriesKey) {
      return;
    }

    entriesKey = nextKey;
    enqueueNew(next);
  };

  $effect(() => {
    syncEntries(playByPlay.entries, true);
  });

  onMount(() => {
    if (!isLive) {
      return;
    }

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/football/matches/${matchId}/facts`,
          livePollFetchInit,
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as MatchPlayByPlayView;
        if (!data.hasData) {
          return;
        }
        enqueueNew(data.entries);
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

{#if activePopup}
  <div
    class={cn(
      "playbyplay-popup pointer-events-none absolute inset-x-2 bottom-3 z-20 mx-auto max-w-[18rem]",
      popupPhase === "enter" && "playbyplay-popup-enter",
      popupPhase === "visible" && "playbyplay-popup-visible",
      popupPhase === "exit" && "playbyplay-popup-exit",
    )}
    role="status"
    aria-live="polite"
  >
    <div
      class={cn(
        "pixel-border bg-card/95 p-2.5 shadow-[3px_3px_0_0_var(--foreground)] backdrop-blur-sm",
        activePopup.isHighlight && "border-[var(--ring)]",
        activePopup.kind === "goal" && "border-[var(--ring)]",
      )}
    >
      <div class="mb-1 flex items-center gap-1.5">
        <span class="text-sm" aria-hidden="true">{entryIcon(activePopup)}</span>
        {#if activePopup.minute}
          <span class="font-pixel text-[8px] tabular-nums uppercase">
            {activePopup.minute}
          </span>
        {/if}
        <span class="font-pixel text-muted-foreground text-[7px] uppercase">
          {kindLabel(activePopup.kind)}
        </span>
      </div>
      <p class="font-retro text-[13px] leading-snug">
        {popupHeadline(activePopup)}
      </p>
      {#if popupSubline(activePopup)}
        <p class="font-retro text-muted-foreground mt-0.5 text-[11px] leading-snug">
          {popupSubline(activePopup)}
        </p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .playbyplay-popup-enter {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }

  .playbyplay-popup-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    transition:
      opacity 0.25s steps(4),
      transform 0.25s steps(4);
  }

  .playbyplay-popup-exit {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
    transition:
      opacity 0.35s steps(4),
      transform 0.35s steps(4);
  }

  @media (prefers-reduced-motion: reduce) {
    .playbyplay-popup-visible,
    .playbyplay-popup-exit {
      transition: none;
    }
  }
</style>