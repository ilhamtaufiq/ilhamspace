<script lang="ts">
  import { cn } from "$lib/utils";

  type Props = {
    label: string;
    homeLabel: string;
    awayLabel: string;
    homeNum: number;
    awayNum: number;
    showBar?: boolean;
    highlighted?: "home" | "away" | "equal";
  };

  let {
    label,
    homeLabel,
    awayLabel,
    homeNum,
    awayNum,
    showBar = true,
    highlighted,
  }: Props = $props();

  const total = $derived(Math.max(homeNum + awayNum, 1));
  const homePct = $derived((homeNum / total) * 100);
</script>

<div class="space-y-1">
  <div class="flex items-center justify-between gap-2">
    <span
      class={cn(
        "font-pixel text-[8px] tabular-nums",
        highlighted === "home" && "text-[var(--team-home)]",
      )}
    >
      {homeLabel}
    </span>
    <span class="font-pixel text-muted-foreground text-[7px] uppercase">
      {label}
    </span>
    <span
      class={cn(
        "font-pixel text-[8px] tabular-nums",
        highlighted === "away" && "text-[var(--team-away)]",
      )}
    >
      {awayLabel}
    </span>
  </div>
  {#if showBar}
    <div class="bg-muted flex h-3 overflow-hidden border-2 border-border">
      <div
        class="h-full bg-[var(--team-home)] transition-all"
        style="width: {homePct}%"
      ></div>
      <div class="h-full flex-1 bg-[var(--team-away)]"></div>
    </div>
  {/if}
</div>