<script lang="ts">
  import MatchEvents from "$lib/components/football/match-events.svelte";
  import MatchFormationPitch from "$lib/components/football/match-formation-pitch.svelte";
  import MatchLiveCommentary from "$lib/components/football/match-live-commentary.svelte";
  import MatchPlayByPlayFeed from "$lib/components/football/match-playbyplay-feed.svelte";
  import MatchLiveChat from "$lib/components/football/match-live-chat.svelte";

  import MatchH2h from "$lib/components/football/match-h2h.svelte";
  import MatchLineup from "$lib/components/football/match-lineup.svelte";
  import MatchMomentum from "$lib/components/football/match-momentum.svelte";
  import MatchPlayerRatings from "$lib/components/football/match-player-ratings.svelte";
  import MatchShotmap from "$lib/components/football/match-shotmap.svelte";
  import MatchShareButton from "$lib/components/football/match-share-button.svelte";
  import MatchStatsPanel from "$lib/components/football/match-stats-panel.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import { getLocaleContext } from "$lib/i18n/context";
  import {
    buildMatchInsightsSummary,
    buildMatchOgImagePath,
    buildMatchShareTitle,
    buildPageTitle,
  } from "$lib/seo/meta";

  import type { PageData } from "./$types";

  let { data, form }: { data: PageData; form: import("./$types").ActionData } =
    $props();
  const { t, locale } = getLocaleContext();
  const match = $derived(data.match);

  const shareTitle = $derived(
    buildMatchShareTitle({
      homeName: match.home.name,
      awayName: match.away.name,
      homeScore: match.home.score,
      awayScore: match.away.score,
      roundLabel: match.roundLabel,
      isLive: match.isLive,
      matchMinute: match.matchMinute,
      statusShort: match.statusShort,
    }),
  );

  const shareDescription = $derived(
    buildMatchInsightsSummary(match.insights) ||
      t("seo.worldCupDescription"),
  );

  const ogImageAlt = $derived(
    `${match.home.name} ${match.home.score} - ${match.away.score} ${match.away.name}`,
  );

  const shareInput = $derived({
    homeName: match.home.name,
    awayName: match.away.name,
    homeScore: match.home.score,
    awayScore: match.away.score,
    matchMinute: match.matchMinute,
    isLive: match.isLive,
    isFinished: match.isFinished,
    statusShort: match.statusShort,
    statusLong: match.statusLong,
    roundLabel: match.roundLabel,
    kickoffLabel: match.kickoffLabel,
    insights: match.insights,
  });
</script>

<HeadMeta
  title={buildPageTitle(`${shareTitle} — ${t("seo.worldCupTitle")}`)}
  description={shareDescription}
  path="/football/world-cup/match/{match.matchId}"
  image={buildMatchOgImagePath(match.matchId)}
  imageAlt={ogImageAlt}
  imageWidth={1200}
  imageHeight={630}
/>

<nav class="mb-4">
  <a
    href="/football/world-cup"
    class="font-pixel text-[8px] uppercase text-[var(--ring)] no-underline hover:underline"
  >
    ← {t("football.backToBracket")}
  </a>
</nav>

<PageTitle href="/football/world-cup/match/{match.matchId}">
  {match.home.name} vs {match.away.name}
</PageTitle>

<p class="font-pixel text-muted-foreground mb-6 text-[8px] uppercase">
  {match.roundLabel}
  · {match.kickoffLabel}
  {#if match.isLive}
    <span class="text-[var(--destructive)]"> · LIVE</span>
  {:else if match.statusShort}
    · {match.statusShort}
  {/if}
</p>

<section class="pixel-border bg-card mb-6 p-4">
  <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
    <div class="text-center sm:text-right">
      <img
        src={FOTMOB_TEAM_LOGO(match.home.id)}
        alt=""
        width="48"
        height="48"
        class="mx-auto mb-2 size-12 image-rendering-pixelated sm:ml-auto sm:mr-0"
      />
      <p class="font-pixel text-[10px] uppercase">{match.home.name}</p>
      {#if match.home.fifaRank}
        <p class="font-pixel text-muted-foreground text-[7px]">
          FIFA #{match.home.fifaRank}
        </p>
      {/if}
    </div>

    <div class="text-center">
      {#if match.matchMinute}
        <p
          class="font-pixel mb-1 text-sm tabular-nums uppercase {match.isLive
            ? 'text-[var(--destructive)]'
            : 'text-muted-foreground'}"
        >
          {match.matchMinute}
        </p>
      {/if}
      <p class="font-pixel text-2xl tabular-nums">
        {match.home.score} - {match.away.score}
      </p>
      <p class="font-pixel text-muted-foreground text-[8px] uppercase">
        {match.statusLong || match.statusShort || "—"}
      </p>
    </div>

    <div class="text-center sm:text-left">
      <img
        src={FOTMOB_TEAM_LOGO(match.away.id)}
        alt=""
        width="48"
        height="48"
        class="mx-auto mb-2 size-12 image-rendering-pixelated sm:ml-0"
      />
      <p class="font-pixel text-[10px] uppercase">{match.away.name}</p>
      {#if match.away.fifaRank}
        <p class="font-pixel text-muted-foreground text-[7px]">
          FIFA #{match.away.fifaRank}
        </p>
      {/if}
    </div>
  </div>

  <div class="mt-4 flex justify-center">
    <MatchShareButton matchId={match.matchId} share={shareInput} />
  </div>
</section>

<MatchFormationPitch
  home={match.homeLineup}
  away={match.awayLineup}
  {locale}
  matchId={match.matchId}
  matchFacts={data.matchFacts}
  playerStatsById={match.playerStatsById}
  isLive={match.isLive}
/>

<MatchPlayByPlayFeed
  matchId={match.matchId}
  playByPlay={data.playByPlay}
  isLive={match.isLive}
  homeTeamId={match.home.id}
  awayTeamId={match.away.id}
/>

<MatchLiveCommentary
  matchId={match.matchId}
  commentary={data.commentary}
  isLive={match.isLive}
/>

{#if match.insights.length > 0}
  <section class="pixel-border border-[var(--ring)] bg-muted/20 mb-6 p-4">
    <h2 class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide">
      {t("football.analysisTitle")}
    </h2>
    <ul class="space-y-2">
      {#each match.insights as insight, index (`insight-${index}`)}
        <li class="font-retro text-sm leading-relaxed">
          <span class="text-[var(--ring)]">▸</span>
          {insight}
        </li>
      {/each}
    </ul>
  </section>
{/if}

<MatchStatsPanel
  matchStats={match.matchStats}
  homeName={match.home.name}
  awayName={match.away.name}
/>

<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
  <MatchMomentum
    points={match.momentum}
    homeName={match.home.name}
    awayName={match.away.name}
    {locale}
  />
  <MatchShotmap
    shots={match.shots}
    homeTeamId={match.home.id}
    awayTeamId={match.away.id}
    homeName={match.home.name}
    awayName={match.away.name}
    {locale}
  />
</div>

<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
  <MatchEvents events={match.events} {locale} />
  {#if match.h2h}
    <MatchH2h
      h2h={match.h2h}
      homeName={match.home.name}
      awayName={match.away.name}
      {locale}
    />
  {/if}
</div>

{#if match.homeLineup || match.awayLineup}
  <section class="mb-6">
    <h2 class="font-pixel text-primary mb-3 text-[10px] uppercase tracking-wide">
      {t("football.lineupTitle")}
    </h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#if match.homeLineup}
        <MatchLineup lineup={match.homeLineup} {locale} />
      {/if}
      {#if match.awayLineup}
        <MatchLineup lineup={match.awayLineup} {locale} />
      {/if}
    </div>
  </section>
{/if}

<MatchPlayerRatings players={match.topPlayers} {locale} />

{#if data.chatEnabled}
  <MatchLiveChat
    matchId={match.matchId}
    initialMessages={data.chatMessages}
    isLive={match.isLive}
    chatError={form?.chatError}
    defaultName={form?.authorName}
  />
{/if}