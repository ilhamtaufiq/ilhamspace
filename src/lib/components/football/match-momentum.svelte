<script lang="ts">
  import type { MatchMomentumPoint } from "$lib/fotmob/types";

  type Props = {
    points: MatchMomentumPoint[];
    homeName: string;
    awayName: string;
    locale: "id" | "en";
  };

  let { points, homeName, awayName, locale }: Props = $props();

  const width = 640;
  const height = 120;
  const padding = 8;

  const path = $derived.by(() => {
    if (points.length === 0) {
      return "";
    }
    const maxMinute = Math.max(...points.map((point) => point.minute), 1);
    const maxAbs = Math.max(...points.map((point) => Math.abs(point.value)), 1);

    return points
      .map((point, index) => {
        const x = padding + (point.minute / maxMinute) * (width - padding * 2);
        const y =
          height / 2 -
          (point.value / maxAbs) * (height / 2 - padding);
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  });
</script>

<section class="pixel-border bg-card p-4">
  <h2 class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide">
    {locale === "id" ? "Momentum pertandingan" : "Match momentum"}
  </h2>
  {#if points.length === 0}
    <p class="font-retro text-muted-foreground text-sm">
      {locale === "id" ? "Data momentum belum tersedia." : "Momentum data unavailable."}
    </p>
  {:else}
    <div class="overflow-x-auto">
      <svg
        viewBox="0 0 {width} {height}"
        class="w-full min-w-[20rem]"
        role="img"
        aria-label={locale === "id" ? "Grafik momentum" : "Momentum chart"}
      >
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          class="stroke-border"
          stroke-width="2"
        />
        <path d={path} fill="none" class="stroke-[var(--ring)]" stroke-width="2" />
      </svg>
    </div>
    <p class="font-pixel text-muted-foreground mt-2 text-[7px] uppercase">
      ↑ {homeName} · ↓ {awayName}
    </p>
  {/if}
</section>