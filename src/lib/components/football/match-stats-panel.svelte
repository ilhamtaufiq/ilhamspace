<script lang="ts">
  import MatchStatBar from "$lib/components/football/match-stat-bar.svelte";
  import type { MatchStatsView } from "$lib/fotmob/types";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  type Props = {
    matchStats: MatchStatsView;
    homeName: string;
    awayName: string;
  };

  const props: Props = $props();

  const { t } = getLocaleContext();

  let activePeriodIndex = $state(0);
  let activeGroupIndex = $state(0);
</script>

{#if props.matchStats.hasData && props.matchStats.periods.length > 0}
  {@const activePeriod = props.matchStats.periods[activePeriodIndex]}
  {#if activePeriod}
    <section class="pixel-border bg-card mb-6 p-4">
      <h2 class="font-pixel text-primary mb-4 text-[10px] uppercase tracking-wide">
        {t("football.statsTitle")}
      </h2>

      {#if props.matchStats.periods.length > 1}
        <div
          class="pixel-border bg-muted/30 mb-3 flex flex-wrap gap-1 p-1.5"
          role="tablist"
          aria-label={t("football.statsPeriodLabel")}
        >
          {#each props.matchStats.periods as period, periodIndex (period.key)}
            <button
              type="button"
              role="tab"
              aria-selected={periodIndex === activePeriodIndex}
              class={cn(
                "font-pixel pixel-border px-2 py-1 text-[7px] uppercase transition-colors",
                periodIndex === activePeriodIndex
                  ? "pixel-nav-active"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
              onclick={() => {
                activePeriodIndex = periodIndex;
                activeGroupIndex = 0;
              }}
            >
              {period.label}
            </button>
          {/each}
        </div>
      {/if}

      <div
        class="mb-4 flex gap-1 overflow-x-auto border-b-2 border-border pb-1"
        role="tablist"
        aria-label={t("football.statsCategoryLabel")}
      >
        {#each activePeriod.groups as group, groupIndex (group.key)}
          <button
            type="button"
            role="tab"
            aria-selected={groupIndex === activeGroupIndex}
            class={cn(
              "font-pixel shrink-0 cursor-pointer border-b-2 px-2 py-1 text-[8px] uppercase transition-colors",
              groupIndex === activeGroupIndex
                ? "border-[var(--ring)] text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
            onclick={() => {
              activeGroupIndex = groupIndex;
            }}
          >
            {group.title}
          </button>
        {/each}
      </div>

      {#each activePeriod.groups as group, groupIndex (group.key)}
        {#if groupIndex === activeGroupIndex}
          <div class="space-y-4" role="tabpanel">
            {#each group.rows as row (row.key)}
              <MatchStatBar
                label={row.label}
                homeLabel={row.home}
                awayLabel={row.away}
                homeNum={row.homeNum}
                awayNum={row.awayNum}
                showBar={row.showBar ?? true}
                highlighted={row.highlighted}
              />
            {/each}
          </div>
        {/if}
      {/each}

      <p class="font-pixel text-muted-foreground mt-4 text-[7px] uppercase">
        {props.homeName} · {props.awayName}
      </p>
    </section>
  {/if}
{/if}