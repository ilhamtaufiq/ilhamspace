<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount, tick } from "svelte";

  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import {
    loadCommentAuthor,
    saveCommentAuthor,
  } from "$lib/comments/author-storage";
  import type { PublicMatchChatMessage } from "$lib/db/match-chat";
  import { connectMatchChatSocket } from "$lib/football/match-chat-socket";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  type Props = {
    matchId: number;
    initialMessages: PublicMatchChatMessage[];
    isLive: boolean;
    chatError?: string;
    defaultName?: string;
  };

  let {
    matchId,
    initialMessages,
    isLive,
    chatError,
    defaultName = "",
  }: Props = $props();

  const { t, locale } = getLocaleContext();

  let messages = $state<PublicMatchChatMessage[]>([]);
  let authorName = $state("");
  let body = $state("");
  let listEl: HTMLDivElement | undefined = $state();
  let seenIds = $state(new Set<string>());
  let seededMatchId = $state<number | null>(null);
  let panelOpen = $state(false);

  const scrollToBottom = async (): Promise<void> => {
    await tick();
    if (listEl) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  };

  const appendMessage = (message: PublicMatchChatMessage): void => {
    if (seenIds.has(message.id)) {
      return;
    }
    seenIds = new Set([...seenIds, message.id]);
    messages = [...messages, message];
    if (panelOpen) {
      void scrollToBottom();
    }
  };

  const formatTime = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleTimeString(locale === "id" ? "id-ID" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tickerItems = $derived(
    messages.map((message) => ({
      id: message.id,
      authorName: message.authorName,
      body: message.body,
    })),
  );

  const tickerDuration = $derived(
    Math.max(18, Math.min(tickerItems.length * 6, 60)),
  );

  /** Dual-copy marquee only when multiple items; one message looked duplicated. */
  const tickerCopies = $derived(tickerItems.length > 1 ? [0, 1] : [0]);
  const tickerAnimated = $derived(tickerItems.length > 1);

  const togglePanel = (): void => {
    panelOpen = !panelOpen;
    if (panelOpen) {
      void scrollToBottom();
    }
  };

  const closePanel = (): void => {
    panelOpen = false;
  };

  $effect(() => {
    if (seededMatchId === matchId) {
      return;
    }

    const ids = new Set<string>();
    for (const message of initialMessages) {
      ids.add(message.id);
    }
    seenIds = ids;
    messages = [...initialMessages];
    seededMatchId = matchId;
  });

  onMount(() => {
    if (!isLive) {
      return;
    }

    const socket = connectMatchChatSocket(matchId, appendMessage);
    return () => {
      socket.close();
    };
  });

  $effect(() => {
    authorName = defaultName || loadCommentAuthor().name;
  });

  $effect(() => {
    if (!panelOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });
</script>

{#if !panelOpen}
  <div
    class="pixel-border bg-card/95 fixed right-[4.75rem] bottom-4 left-4 z-40 overflow-hidden border-[var(--ring)] py-1.5 shadow-sm backdrop-blur-sm sm:right-20 sm:left-6"
    aria-hidden="true"
  >
    <div class="ticker-mask relative h-5 overflow-hidden">
      {#if tickerItems.length > 0}
        <div
          class={cn(
            "ticker-track flex w-max items-center gap-8 whitespace-nowrap",
            tickerAnimated && "ticker-track-animated",
          )}
          style={tickerAnimated
            ? `--ticker-duration: ${tickerDuration}s`
            : undefined}
        >
          {#each tickerCopies as copy (copy)}
            {#each tickerItems as item (`${copy}-${item.id}`)}
              <span class="font-retro inline-flex items-center gap-2 text-xs">
                <span class="font-pixel text-[var(--ring)] text-[8px]">
                  {item.authorName}
                </span>
                <span class="text-muted-foreground">:</span>
                <span>{item.body}</span>
                <span class="text-[var(--ring)] opacity-60">◆</span>
              </span>
            {/each}
          {/each}
        </div>
      {:else}
        <p
          class="font-retro text-muted-foreground animate-pulse px-3 text-xs whitespace-nowrap"
        >
          {t("football.liveChatTickerEmpty")}
        </p>
      {/if}
    </div>
  </div>
{/if}

<button
  type="button"
  class={cn(
    "pixel-border fixed right-4 bottom-4 z-50 flex size-14 flex-col items-center justify-center bg-card shadow-md transition-colors",
    panelOpen && "border-[var(--ring)] bg-accent",
    isLive && !panelOpen && "border-[var(--destructive)]",
  )}
  aria-label={panelOpen ? t("football.liveChatClose") : t("football.liveChatOpen")}
  aria-expanded={panelOpen}
  onclick={togglePanel}
>
  <span class="text-lg leading-none" aria-hidden="true">💬</span>
  <span class="font-pixel mt-0.5 text-[7px] uppercase">
    {#if isLive}
      <span class="text-[var(--destructive)]">Live</span>
    {:else}
      Chat
    {/if}
  </span>
  {#if messages.length > 0 && !panelOpen}
    <span
      class="font-pixel bg-[var(--ring)] text-background absolute -top-1 -right-1 flex size-5 items-center justify-center text-[7px]"
    >
      {messages.length > 99 ? "99+" : messages.length}
    </span>
  {/if}
</button>

{#if panelOpen}
  <button
    type="button"
    class="fixed inset-0 z-40 bg-background/60 backdrop-blur-[1px]"
    aria-label={t("football.liveChatClose")}
    onclick={closePanel}
  ></button>

  <div
    class="pixel-border bg-card fixed right-4 bottom-20 z-50 flex w-[min(100vw-2rem,22rem)] flex-col shadow-lg sm:w-96"
    role="dialog"
    aria-modal="true"
    aria-labelledby="live-chat-title"
  >
    <div class="flex items-center justify-between gap-2 border-b-2 border-border p-3">
      <div>
        <h2
          id="live-chat-title"
          class="font-pixel text-primary text-[10px] uppercase tracking-wide"
        >
          {t("football.liveChatTitle")}
        </h2>
        {#if isLive}
          <p class="font-pixel text-[var(--destructive)] text-[7px] uppercase">
            ● {t("football.liveChatLive")}
          </p>
        {:else}
          <p class="font-pixel text-muted-foreground text-[7px] uppercase">
            {t("football.liveChatPreMatch")}
          </p>
        {/if}
      </div>
      <Button type="button" variant="ghost" size="sm" onclick={closePanel}>
        ✕
      </Button>
    </div>

    <div
      bind:this={listEl}
      class="bg-muted/20 h-56 overflow-y-auto p-3"
      aria-live="polite"
      aria-relevant="additions"
    >
      {#if messages.length === 0}
        <p class="font-retro text-muted-foreground text-center text-sm">
          {t("football.liveChatEmpty")}
        </p>
      {:else}
        <ul class="space-y-2">
          {#each messages as message (message.id)}
            <li class="border-b border-border/50 pb-2 last:border-0">
              <div class="flex items-baseline justify-between gap-2">
                <span class="font-pixel text-[8px] text-[var(--ring)]">
                  {message.authorName}
                </span>
                <time
                  class="font-pixel text-muted-foreground text-[7px] tabular-nums"
                  datetime={message.createdAt}
                >
                  {formatTime(message.createdAt)}
                </time>
              </div>
              <p class="font-retro mt-0.5 text-sm leading-snug break-words">
                {message.body}
              </p>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <form
      method="POST"
      action="?/chat"
      class="space-y-2 border-t-2 border-border p-3"
      use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === "success") {
            const data = result.data as {
              message?: PublicMatchChatMessage;
            };
            if (data?.message) {
              appendMessage(data.message);
            }
            body = "";
            if (authorName.trim()) {
              saveCommentAuthor({
                name: authorName.trim(),
                email: loadCommentAuthor().email,
              });
            }
            return;
          }

          await update({ reset: false, invalidateAll: false });
        };
      }}
    >
      {#if chatError}
        <p class="font-pixel text-destructive text-[8px] uppercase" role="alert">
          {chatError}
        </p>
      {/if}

      <Input
        id="chat-author-name"
        name="authorName"
        required
        maxlength={40}
        autocomplete="nickname"
        placeholder={t("football.liveChatNamePlaceholder")}
        bind:value={authorName}
        aria-label={t("football.liveChatName")}
      />

      <Textarea
        id="chat-body"
        name="body"
        required
        maxlength={300}
        rows={2}
        placeholder={t("football.liveChatMessagePlaceholder")}
        bind:value={body}
        aria-label={t("football.liveChatMessage")}
      />

      <Button type="submit" size="sm" class="w-full">
        {t("football.liveChatSend")}
      </Button>
    </form>
  </div>
{/if}

<style>
  .ticker-track-animated {
    animation: chat-ticker-scroll var(--ticker-duration, 24s) linear infinite;
  }

  .ticker-track-animated:hover {
    animation-play-state: paused;
  }

  .ticker-mask::before,
  .ticker-mask::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1.5rem;
    z-index: 1;
    pointer-events: none;
  }

  .ticker-mask::before {
    left: 0;
    background: linear-gradient(to right, var(--card), transparent);
  }

  .ticker-mask::after {
    right: 0;
    background: linear-gradient(to left, var(--card), transparent);
  }

  @keyframes chat-ticker-scroll {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ticker-track-animated {
      animation: none;
      flex-wrap: wrap;
      white-space: normal;
      width: 100%;
    }
  }
</style>