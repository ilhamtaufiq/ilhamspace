<script lang="ts">
  import { onMount } from "svelte";

  import {
    buildLiveClockAnchor,
    formatLiveClock,
    type LiveClockAnchor,
  } from "$lib/football/match-live-clock";
  import type { MatchLiveClock } from "$lib/fotmob/types";
  import { cn } from "$lib/utils";

  type Props = {
    matchMinute: string;
    liveClock?: MatchLiveClock;
    isLive: boolean;
    class?: string;
  };

  let {
    matchMinute,
    liveClock,
    isLive,
    class: className = "",
  }: Props = $props();

  let now = $state(Date.now());
  let anchor = $state<LiveClockAnchor>({
    ticking: false,
    staticLabel: "",
    baseSeconds: 0,
    syncedAt: Date.now(),
  });
  let prevAnchor: LiveClockAnchor | undefined;

  $effect(() => {
    const next = buildLiveClockAnchor(
      { matchMinute, liveClock, isLive },
      prevAnchor,
    );
    prevAnchor = next;
    anchor = next;
  });

  const display = $derived(formatLiveClock(anchor, now));

  onMount(() => {
    const timer = setInterval(() => {
      now = Date.now();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });
</script>

{#if display}
  <p
    class={cn(
      "font-pixel mb-1 text-sm tabular-nums uppercase",
      isLive ? "text-[var(--destructive)]" : "text-muted-foreground",
      className,
    )}
    aria-live={isLive ? "polite" : undefined}
  >
    {display}
  </p>
{/if}