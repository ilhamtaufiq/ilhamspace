<script lang="ts">
  import { onMount } from "svelte";

  import Button from "$lib/components/ui/button.svelte";
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import { getPlayerRating } from "$lib/fotmob/match-player-stats";
  import type { MatchPlayerDetail } from "$lib/fotmob/types";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  type Props = {
    player: MatchPlayerDetail;
    onClose: () => void;
  };

  let { player, onClose }: Props = $props();

  const { t } = getLocaleContext();
  const rating = $derived(getPlayerRating(player));

  const ratingClass = (value: number): string => {
    if (value >= 8) {
      return "bg-[var(--team-home)] text-[var(--background)]";
    }
    if (value >= 7) {
      return "bg-accent text-[var(--accent-foreground)]";
    }
    return "bg-muted text-foreground";
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  onMount(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<button
  type="button"
  class="fixed inset-0 z-50 bg-background/70 backdrop-blur-[1px]"
  aria-label={t("football.playerDetailClose")}
  onclick={onClose}
></button>

<div
  class="pixel-border bg-card fixed top-1/2 left-1/2 z-50 flex max-h-[min(85vh,36rem)] w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 flex-col shadow-lg"
  role="dialog"
  aria-modal="true"
  aria-labelledby="player-detail-title"
>
  <div class="flex items-start justify-between gap-3 border-b-2 border-border p-4">
    <div class="flex min-w-0 items-start gap-3">
      <img
        src={FOTMOB_TEAM_LOGO(player.teamId)}
        alt=""
        width="32"
        height="32"
        class="size-8 shrink-0 image-rendering-pixelated"
      />
      <div class="min-w-0">
        <h2
          id="player-detail-title"
          class="font-retro truncate text-base leading-tight"
        >
          {player.name}
        </h2>
        <p class="font-pixel text-muted-foreground mt-1 text-[7px] uppercase">
          {player.teamName} · #{player.shirtNumber}
        </p>
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      {#if rating !== null}
        <span
          class={cn(
            "font-pixel px-2 py-1 text-[10px] tabular-nums",
            ratingClass(rating),
          )}
        >
          {rating.toFixed(1)}
        </span>
      {/if}
      <Button type="button" variant="ghost" size="sm" onclick={onClose}>
        ✕
      </Button>
    </div>
  </div>

  <div class="overflow-y-auto p-4">
    {#if !player.hasStats}
      <p class="font-retro text-muted-foreground text-sm">
        {t("football.playerDetailNoStats")}
      </p>
    {:else}
      <div class="space-y-4">
        {#each player.groups as group (group.key)}
          <section>
            <h3 class="font-pixel text-primary mb-2 text-[8px] uppercase">
              {group.title}
            </h3>
            <dl class="space-y-1.5">
              {#each group.items as item (item.key)}
                <div class="flex items-baseline justify-between gap-3">
                  <dt class="font-retro text-muted-foreground text-[11px]">
                    {item.label}
                  </dt>
                  <dd class="font-pixel shrink-0 text-[9px] tabular-nums">
                    {item.value}
                  </dd>
                </div>
              {/each}
            </dl>
          </section>
        {/each}
      </div>
    {/if}
  </div>
</div>