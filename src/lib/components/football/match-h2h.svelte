<script lang="ts">
  import type { MatchH2HRecord } from "$lib/fotmob/types";

  type Props = {
    h2h: MatchH2HRecord;
    homeName: string;
    awayName: string;
    locale: "id" | "en";
  };

  let { h2h, homeName, awayName, locale }: Props = $props();

  const formatDate = (iso: string): string => {
    if (!iso) {
      return "—";
    }
    return new Date(iso).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
</script>

<section class="pixel-border bg-card p-4">
  <h2 class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide">
    {locale === "id" ? "Head to head" : "Head to head"}
  </h2>
  <div class="mb-4 grid grid-cols-3 gap-2 text-center">
    <div class="pixel-border bg-muted/30 p-2">
      <p class="font-pixel text-[8px] uppercase">{homeName}</p>
      <p class="font-pixel text-lg">{h2h.homeWins}</p>
    </div>
    <div class="pixel-border bg-muted/30 p-2">
      <p class="font-pixel text-[8px] uppercase">
        {locale === "id" ? "Seri" : "Draws"}
      </p>
      <p class="font-pixel text-lg">{h2h.draws}</p>
    </div>
    <div class="pixel-border bg-muted/30 p-2">
      <p class="font-pixel text-[8px] uppercase">{awayName}</p>
      <p class="font-pixel text-lg">{h2h.awayWins}</p>
    </div>
  </div>
  {#if h2h.recent.length > 0}
    <p class="font-pixel text-muted-foreground mb-2 text-[7px] uppercase">
      {locale === "id" ? "Pertemuan terakhir" : "Recent meetings"}
    </p>
    <ul class="space-y-2">
      {#each h2h.recent as meeting, index (`${meeting.date}-${index}`)}
        <li class="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0">
          <span class="font-retro min-w-0 flex-1 truncate text-xs">
            {meeting.homeName} vs {meeting.awayName}
          </span>
          <span class="font-pixel text-[8px] tabular-nums">{meeting.score}</span>
          <span class="font-pixel text-muted-foreground text-[7px]">
            {formatDate(meeting.date)}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</section>