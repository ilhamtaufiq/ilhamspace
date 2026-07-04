<script lang="ts">
  import { onMount } from "svelte";

  import MatchEvents from "$lib/components/football/match-events.svelte";
  import MatchFormationPitch from "$lib/components/football/match-formation-pitch.svelte";
  import MatchAudioCommentary from "$lib/components/football/match-audio-commentary.svelte";
  import MatchLiveCommentary from "$lib/components/football/match-live-commentary.svelte";
  import MatchEventTimeline from "$lib/components/football/match-event-timeline.svelte";
  import MatchPlayByPlayFeed from "$lib/components/football/match-playbyplay-feed.svelte";
  import MatchLiveChat from "$lib/components/football/match-live-chat.svelte";

  import MatchH2h from "$lib/components/football/match-h2h.svelte";
  import MatchLiveClock from "$lib/components/football/match-live-clock.svelte";
  import MatchLineup from "$lib/components/football/match-lineup.svelte";
  import MatchMomentum from "$lib/components/football/match-momentum.svelte";
  import MatchPlayerRatings from "$lib/components/football/match-player-ratings.svelte";
  import MatchShotmap from "$lib/components/football/match-shotmap.svelte";
  import MatchShareButton from "$lib/components/football/match-share-button.svelte";
  import MatchStoryButton from "$lib/components/football/match-story-button.svelte";
  import MatchStatsPanel from "$lib/components/football/match-stats-panel.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import { startMatchLivePolling } from "$lib/football/match-live-poll";
  import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";
  import {
    buildMatchInsightsSummary,
    buildMatchOgImagePath,
    type MatchOgSnapshot,
    buildMatchShareTitle,
    buildPageTitle,
  } from "$lib/seo/meta";

  import type { PageData } from "./$types";

  let { data, form }: { data: PageData; form: import("./$types").ActionData } =
    $props();
  const { t, locale } = getLocaleContext();

  let liveMatchOverride = $state<PageData["match"] | undefined>(undefined);
  let liveMatchFactsOverride = $state<PageData["matchFacts"] | undefined>(
    undefined,
  );

  $effect(() => {
    data.match.matchId;
    liveMatchOverride = undefined;
    liveMatchFactsOverride = undefined;
  });

  onMount(() => {
    if (!data.match.isLive) {
      return;
    }

    return startMatchLivePolling(data.match.matchId, (snapshot) => {
      liveMatchOverride = snapshot.match;
      liveMatchFactsOverride = snapshot.matchFacts;
    });
  });

  const match = $derived(liveMatchOverride ?? data.match);
  const matchFacts = $derived(liveMatchFactsOverride ?? data.matchFacts);

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

  const ogSnapshot = $derived({
    homeScore: match.home.score,
    awayScore: match.away.score,
    statusShort: match.statusShort,
  } satisfies MatchOgSnapshot);

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
  image={buildMatchOgImagePath(match.matchId, ogSnapshot)}
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
      <MatchLiveClock
        matchMinute={match.matchMinute}
        liveClock={match.liveClock}
        isLive={match.isLive}
      />
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

  <div class="mt-4 flex flex-wrap items-start justify-center gap-4">
    <MatchShareButton matchId={match.matchId} share={shareInput} />
    <MatchStoryButton
      matchId={match.matchId}
      share={shareInput}
      snapshot={ogSnapshot}
    />
  </div>
</section>

{#if match.isLive}
  <MatchPlayByPlayFeed
    matchId={match.matchId}
    playByPlay={data.playByPlay}
    isLive={match.isLive}
    homeTeamId={match.home.id}
    awayTeamId={match.away.id}
  />
{:else if match.isFinished}
  <MatchEventTimeline
    playByPlay={data.playByPlay}
    events={match.events}
    homeName={match.home.name}
    awayName={match.away.name}
    homeTeamId={match.home.id}
    awayTeamId={match.away.id}
  />
{/if}

<MatchFormationPitch
  home={match.homeLineup}
  away={match.awayLineup}
  {locale}
  matchId={match.matchId}
  matchFacts={matchFacts}
  playerStatsById={match.playerStatsById}
  isLive={match.isLive}
/>

<MatchAudioCommentary matchId={match.matchId} isLive={match.isLive} />

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

{#if !match.isFinished || match.h2h}
  <div
    class={cn(
      "mb-6 grid grid-cols-1 gap-4",
      !match.isFinished && match.h2h && "lg:grid-cols-2",
    )}
  >
    {#if !match.isFinished}
      <MatchEvents events={match.events} {locale} />
    {/if}
    {#if match.h2h}
      <MatchH2h
        h2h={match.h2h}
        homeName={match.home.name}
        awayName={match.away.name}
        {locale}
      />
    {/if}
  </div>
{/if}

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