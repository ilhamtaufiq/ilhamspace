<script lang="ts">
  import type { MatchEventView } from "$lib/fotmob/types";

  type Props = {
    events: MatchEventView[];
    locale: "id" | "en";
  };

  let { events, locale }: Props = $props();
</script>

<section class="pixel-border bg-card p-4">
  <h2 class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide">
    {locale === "id" ? "Linimasa" : "Timeline"}
  </h2>
  {#if events.length === 0}
    <p class="font-retro text-muted-foreground text-sm">
      {locale === "id" ? "Belum ada kejadian." : "No events yet."}
    </p>
  {:else}
    <ol class="space-y-2">
      {#each events as event (event.id)}
        <li class="flex items-start gap-3 border-b-2 border-border pb-2 last:border-0">
          <span class="font-pixel text-[10px] tabular-nums">{event.minute}'</span>
          <div class="min-w-0 flex-1">
            <p class="font-retro text-sm">
              {#if event.type === "goal"}
                ⚽ {event.playerName}
                {#if event.detail}
                  <span class="text-muted-foreground text-xs">({event.detail})</span>
                {/if}
              {:else}
                🟥 {event.playerName}
              {/if}
            </p>
            {#if event.scoreAfter}
              <p class="font-pixel text-muted-foreground text-[8px]">
                {event.scoreAfter}
              </p>
            {/if}
          </div>
          <span class="font-pixel text-muted-foreground text-[7px] uppercase">
            {event.team === "home"
              ? locale === "id"
                ? "Kandang"
                : "Home"
              : locale === "id"
                ? "Tandang"
                : "Away"}
          </span>
        </li>
      {/each}
    </ol>
  {/if}
</section>