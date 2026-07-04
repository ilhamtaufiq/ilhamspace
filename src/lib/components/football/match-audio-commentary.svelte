<script lang="ts">
  import { onMount } from "svelte";

  import { attachMatchAudioStream } from "$lib/football/match-audio-player";
  import type { MatchAudioPlayer } from "$lib/football/match-audio-player";
  import { livePollFetchInit } from "$lib/football/poll-intervals";
  import type { MatchAudioLang, MatchAudioView } from "$lib/fotmob/types";
  import { getLocaleContext } from "$lib/i18n/context";
  import type { MessageKey } from "$lib/i18n";
  import Button from "$lib/components/ui/button.svelte";
  import { cn } from "$lib/utils";

  type Props = {
    matchId: number;
    isLive: boolean;
  };

  let { matchId, isLive }: Props = $props();

  const { t } = getLocaleContext();

  let audioEl = $state<HTMLAudioElement | null>(null);
  let player = $state<MatchAudioPlayer | null>(null);
  let audioMeta = $state<MatchAudioView | null>(null);
  let selectedLang = $state<MatchAudioLang>("ENG");
  let playing = $state(false);
  let loading = $state(false);
  let errorKey = $state<MessageKey | null>(null);

  const activeStream = $derived(
    audioMeta?.streams.find((stream) => stream.lang === selectedLang) ??
      audioMeta?.streams[0],
  );

  const destroyPlayer = (): void => {
    player?.destroy();
    player = null;
    playing = false;
  };

  const loadAudioMeta = async (): Promise<void> => {
    const response = await fetch(
      `/api/football/matches/${matchId}/audio`,
      livePollFetchInit,
    );
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as MatchAudioView;
    audioMeta = data;
    if (data.available && !data.languages.includes(selectedLang)) {
      selectedLang = data.defaultLang;
    }
  };

  const startPlayback = async (): Promise<void> => {
    if (!audioEl || !activeStream) {
      return;
    }

    loading = true;
    errorKey = null;

    try {
      destroyPlayer();
      player = await attachMatchAudioStream(audioEl, activeStream.streamUrl);
      await player.play();
      playing = true;
    } catch {
      destroyPlayer();
      errorKey = "football.audioCommentaryError";
    } finally {
      loading = false;
    }
  };

  const stopPlayback = (): void => {
    destroyPlayer();
  };

  const togglePlayback = async (): Promise<void> => {
    if (playing) {
      stopPlayback();
      return;
    }
    await startPlayback();
  };

  const selectLang = async (lang: MatchAudioLang): Promise<void> => {
    if (lang === selectedLang) {
      return;
    }
    selectedLang = lang;
    if (playing) {
      await startPlayback();
    }
  };

  onMount(() => {
    if (!isLive) {
      return;
    }

    void loadAudioMeta();

    return () => {
      destroyPlayer();
    };
  });
</script>

{#if isLive && audioMeta?.available}
  <section class="pixel-border bg-card mb-6 overflow-hidden">
    <header
      class="flex flex-wrap items-center gap-3 border-b-2 border-border bg-muted/30 px-4 py-3"
    >
      <div class="audio-mic-wrap" aria-hidden="true">
        <svg viewBox="0 0 20 24" class="audio-mic size-7" role="presentation">
          <rect x="7" y="2" width="6" height="10" fill="currentColor" />
          <rect x="5" y="12" width="10" height="2" fill="currentColor" />
          <rect x="9" y="14" width="2" height="5" fill="currentColor" />
          <rect x="6" y="19" width="8" height="2" fill="currentColor" />
        </svg>
        {#if playing}
          <div class="audio-waves" aria-hidden="true">
            <span class="audio-wave audio-wave-1"></span>
            <span class="audio-wave audio-wave-2"></span>
            <span class="audio-wave audio-wave-3"></span>
          </div>
        {/if}
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="font-pixel text-primary text-[10px] uppercase tracking-wide">
          {t("football.audioCommentaryTitle")}
        </h2>
        <p class="font-pixel text-[7px] uppercase text-[var(--destructive)]">
          <span class="audio-live-dot" aria-hidden="true"></span>
          {t("football.audioCommentaryOnAir")}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        class="font-pixel text-[8px] uppercase"
        disabled={loading || !activeStream}
        onclick={() => void togglePlayback()}
      >
        {#if loading}
          {t("football.audioCommentaryLoading")}
        {:else if playing}
          {t("football.audioCommentaryStop")}
        {:else}
          {t("football.audioCommentaryPlay")}
        {/if}
      </Button>
    </header>

    <div class="space-y-3 p-4">
      {#if audioMeta.languages.length > 1}
        <div
          class="flex flex-wrap gap-1"
          role="group"
          aria-label={t("football.audioCommentaryLanguage")}
        >
          {#each audioMeta.languages as lang (lang)}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              class={cn(
                "font-pixel text-[8px] uppercase",
                lang === selectedLang && "pixel-nav-active",
              )}
              onclick={() => void selectLang(lang)}
            >
              {lang}
            </Button>
          {/each}
        </div>
      {/if}

      <p class="font-retro text-muted-foreground text-xs">
        {t("football.audioCommentaryHint")}
      </p>

      {#if errorKey}
        <p class="font-pixel text-[8px] uppercase text-[var(--destructive)]">
          {t(errorKey)}
        </p>
      {/if}
    </div>

    <audio bind:this={audioEl} class="sr-only" preload="none"></audio>
  </section>
{/if}

<style>
  .audio-mic-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--foreground);
  }

  .audio-mic {
    image-rendering: pixelated;
  }

  .audio-waves {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
  }

  .audio-wave {
    display: block;
    width: 3px;
    background: var(--ring);
    image-rendering: pixelated;
  }

  .audio-wave-1 {
    height: 5px;
    animation: audio-wave-a 0.8s steps(2) infinite;
  }

  .audio-wave-2 {
    height: 9px;
    animation: audio-wave-b 0.8s steps(2) infinite 0.15s;
  }

  .audio-wave-3 {
    height: 4px;
    animation: audio-wave-c 0.8s steps(2) infinite 0.3s;
  }

  .audio-live-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 4px;
    background: var(--destructive);
    vertical-align: middle;
    animation: audio-live-blink 1s steps(2) infinite;
  }

  @keyframes audio-wave-a {
    0%,
    100% {
      height: 3px;
    }
    50% {
      height: 8px;
    }
  }

  @keyframes audio-wave-b {
    0%,
    100% {
      height: 6px;
    }
    50% {
      height: 12px;
    }
  }

  @keyframes audio-wave-c {
    0%,
    100% {
      height: 2px;
    }
    50% {
      height: 7px;
    }
  }

  @keyframes audio-live-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .audio-wave,
    .audio-live-dot {
      animation: none;
    }
  }
</style>