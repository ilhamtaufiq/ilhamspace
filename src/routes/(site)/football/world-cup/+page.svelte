<script lang="ts">
  import KnockoutBracket from "$lib/components/football/knockout-bracket.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import { getLocaleContext } from "$lib/i18n/context";
  import { buildPageTitle } from "$lib/seo/meta";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { t, locale } = getLocaleContext();
</script>

<HeadMeta
  title={buildPageTitle(t("seo.worldCupTitle"))}
  description={t("seo.worldCupDescription")}
  path="/football/world-cup"
/>

<PageTitle href="/football/world-cup">{t("football.worldCupTitle")}</PageTitle>

<p class="font-retro text-muted-foreground mb-6 text-base">
  {t("football.worldCupIntro")}
  {#if data.season}
    <span class="font-pixel text-[10px] uppercase"> — {data.season}</span>
  {/if}
</p>

{#if data.error}
  <div class="pixel-border border-[var(--destructive)] bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase text-[var(--destructive)]">
      {t("football.errorTitle")}
    </p>
    <p class="font-retro text-muted-foreground mt-3 text-sm">{data.error}</p>
    <p class="font-retro text-muted-foreground mt-2 text-xs">
      {t("football.errorHint")}
    </p>
  </div>
{:else if data.rounds.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">{t("football.emptyTitle")}</p>
  </div>
{:else}
  <KnockoutBracket rounds={data.rounds} locale={locale} />
{/if}