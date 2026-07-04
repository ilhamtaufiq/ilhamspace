<script lang="ts">
  import { onMount } from "svelte";

  import type {
    MatchCommentaryEntry,
    MatchCommentaryView,
  } from "$lib/fotmob/types";
  import { getLocaleContext } from "$lib/i18n/context";
  import type { MessageKey } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const COMMENTARY_TYPE_KEYS: Record<string, MessageKey> = {
    comment: "football.commentaryType.comment",
    YC: "football.commentaryType.YC",
    RC: "football.commentaryType.RC",
    SI: "football.commentaryType.SI",
    "post_match summary": "football.commentaryType.post_match summary",
  };

  type Props = {
    matchId: number;
    commentary: MatchCommentaryView;
    isLive: boolean;
  };

  let { matchId, commentary, isLive }: Props = $props();

  const { t } = getLocaleContext();

  let entries = $state<MatchCommentaryEntry[]>([]);
  let lastUpdated = $state<string | undefined>(undefined);
  let seenIds = $state(new Set<string>());
  let freshIds = $state(new Set<string>());
  let seeded = $state(false);

  const typeLabel = (type: string): string => {
    const key = COMMENTARY_TYPE_KEYS[type];
    return key ? t(key) : type;
  };

  const syncEntries = (
    next: MatchCommentaryEntry[],
    animateNew = true,
  ): void => {
    if (!seeded) {
      seeded = true;
      seenIds = new Set(next.map((entry) => entry.id));
      entries = next;
      return;
    }

    const newFresh = new Set<string>();
    if (animateNew) {
      for (const entry of next) {
        if (!seenIds.has(entry.id)) {
          newFresh.add(entry.id);
        }
      }
    }
    seenIds = new Set(next.map((entry) => entry.id));
    entries = next;
    if (newFresh.size > 0) {
      freshIds = newFresh;
      setTimeout(() => {
        freshIds = new Set();
      }, 1200);
    }
  };

  $effect(() => {
    syncEntries(commentary.entries, false);
    lastUpdated = commentary.lastUpdated;
  });

  onMount(() => {
    if (!isLive) {
      return;
    }

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/football/matches/${matchId}/comments`,
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as MatchCommentaryView;
        if (!data.hasData) {
          return;
        }
        syncEntries(data.entries);
        lastUpdated = data.lastUpdated;
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

{#if entries.length > 0}
  <section class="pixel-border bg-card commentary-section mb-6 overflow-hidden">
    <header
      class="flex items-center gap-3 border-b-2 border-border bg-muted/30 px-4 py-3"
    >
      <div class="commentary-mic-wrap" aria-hidden="true">
        <svg
          viewBox="0 0 20 24"
          class="commentary-mic size-8 image-rendering-pixelated"
          role="presentation"
        >
          <rect x="7" y="2" width="6" height="10" fill="currentColor" />
          <rect x="5" y="12" width="10" height="2" fill="currentColor" />
          <rect x="9" y="14" width="2" height="5" fill="currentColor" />
          <rect x="6" y="19" width="8" height="2" fill="currentColor" />
        </svg>
        <div class="commentary-waves">
          <span class="commentary-wave commentary-wave-1"></span>
          <span class="commentary-wave commentary-wave-2"></span>
          <span class="commentary-wave commentary-wave-3"></span>
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="font-pixel text-primary text-[10px] uppercase tracking-wide">
          {t("football.commentaryTitle")}
        </h2>
        {#if isLive}
          <p class="font-pixel text-[7px] uppercase text-[var(--destructive)]">
            <span class="commentary-live-dot" aria-hidden="true"></span>
            {t("football.commentaryOnAir")}
          </p>
        {/if}
      </div>
    </header>

    <ol
      class="commentary-list max-h-[28rem] space-y-0 overflow-y-auto p-3"
      aria-live={isLive ? "polite" : "off"}
    >
      {#each entries as entry (entry.id)}
        <li
          class={cn(
            "commentary-item pixel-border mb-2 bg-background p-3 last:mb-0",
            entry.isHighlight && "border-[var(--ring)]",
            entry.type === "post_match summary" && "border-accent",
            freshIds.has(entry.id) && "commentary-item-fresh",
          )}
        >
          <div class="mb-1.5 flex flex-wrap items-center gap-2">
            {#if entry.minute}
              <span
                class="font-pixel bg-muted px-1.5 py-0.5 text-[8px] tabular-nums uppercase"
              >
                {entry.minute}
              </span>
            {/if}
            <span class="font-pixel text-muted-foreground text-[7px] uppercase">
              {typeLabel(entry.type)}
            </span>
            {#if entry.team}
              <span class="font-pixel text-[7px] uppercase text-[var(--ring)]">
                {entry.team === "home"
                  ? t("football.commentaryHome")
                  : t("football.commentaryAway")}
              </span>
            {/if}
          </div>
          <p class="font-retro text-sm leading-relaxed">{entry.description}</p>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<style>
  .commentary-mic-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 2px;
    color: var(--foreground);
  }

  .commentary-mic {
    animation: mic-bob 1.2s steps(2) infinite;
  }

  .commentary-waves {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 16px;
  }

  .commentary-wave {
    display: block;
    width: 3px;
    background: var(--ring);
    image-rendering: pixelated;
  }

  .commentary-wave-1 {
    height: 6px;
    animation: wave-a 0.8s steps(2) infinite;
  }

  .commentary-wave-2 {
    height: 10px;
    animation: wave-b 0.8s steps(2) infinite 0.15s;
  }

  .commentary-wave-3 {
    height: 5px;
    animation: wave-c 0.8s steps(2) infinite 0.3s;
  }

  .commentary-live-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 4px;
    background: var(--destructive);
    vertical-align: middle;
    animation: live-blink 1s steps(2) infinite;
  }

  .commentary-item-fresh {
    animation: commentary-reveal 0.5s steps(4) forwards;
  }

  @keyframes mic-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }

  @keyframes wave-a {
    0%,
    100% {
      height: 4px;
    }
    50% {
      height: 10px;
    }
  }

  @keyframes wave-b {
    0%,
    100% {
      height: 8px;
    }
    50% {
      height: 14px;
    }
  }

  @keyframes wave-c {
    0%,
    100% {
      height: 3px;
    }
    50% {
      height: 8px;
    }
  }

  @keyframes live-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  @keyframes commentary-reveal {
    from {
      opacity: 0;
      transform: translateX(-6px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .commentary-mic,
    .commentary-wave,
    .commentary-live-dot,
    .commentary-item-fresh {
      animation: none;
    }
  }
</style>