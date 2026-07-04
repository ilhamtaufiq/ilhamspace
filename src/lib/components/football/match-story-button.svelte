<script lang="ts">
  import { browser } from "$app/environment";

  import Button from "$lib/components/ui/button.svelte";
  import type { MatchShareInput } from "$lib/football/match-share";
  import { getLocaleContext } from "$lib/i18n/context";
  import {
    buildAbsoluteUrl,
    buildMatchStoryImagePath,
    type MatchOgSnapshot,
  } from "$lib/seo/meta";
  import { cn } from "$lib/utils";

  type Props = {
    matchId: number;
    share: MatchShareInput;
    snapshot: MatchOgSnapshot;
  };

  type SavePickerWindow = Window & {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  };

  let { matchId, share, snapshot }: Props = $props();

  const { t } = getLocaleContext();

  let dialogEl = $state<HTMLDialogElement | null>(null);
  let busy = $state(false);
  let storyBlob = $state<Blob | null>(null);
  let status = $state<"idle" | "downloaded" | "shared" | "error">("idle");

  const slugify = (value: string): string =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "match";

  const storyPath = $derived(buildMatchStoryImagePath(matchId, snapshot));
  const storyUrl = $derived(buildAbsoluteUrl(storyPath));
  const fileName = $derived(
    `ilhamspace-${slugify(share.homeName)}-vs-${slugify(share.awayName)}-story.png`,
  );

  const statusLabel = $derived(
    status === "downloaded"
      ? t("football.storyDone")
      : status === "shared"
        ? t("football.storyShared")
        : status === "error"
          ? t("football.storyError")
          : "",
  );

  const dialogActionClass =
    "font-pixel w-full uppercase active:!translate-x-0 active:!translate-y-0";

  const resetStatus = (): void => {
    setTimeout(() => {
      status = "idle";
    }, 2400);
  };

  const close = (): void => {
    dialogEl?.close();
  };

  const fetchStoryBlob = async (): Promise<Blob> => {
    const response = await fetch(storyPath, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("Story image unavailable");
    }
    return response.blob();
  };

  const ensureStoryBlob = async (): Promise<Blob | null> => {
    if (storyBlob) {
      return storyBlob;
    }

    try {
      const blob = await fetchStoryBlob();
      storyBlob = blob;
      return blob;
    } catch {
      return null;
    }
  };

  const triggerAnchorDownload = (blob: Blob): void => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 2000);
  };

  const saveStoryToDisk = async (blob: Blob): Promise<boolean> => {
    const savePicker = (window as SavePickerWindow).showSaveFilePicker;
    if (savePicker) {
      try {
        const handle = await savePicker({
          suggestedName: fileName,
          types: [
            {
              description: "PNG image",
              accept: { "image/png": [".png"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return false;
        }
      }
    }

    triggerAnchorDownload(blob);
    return true;
  };

  const prefetchStory = async (): Promise<void> => {
    if (!browser || storyBlob) {
      return;
    }
    storyBlob = await ensureStoryBlob();
  };

  const downloadStory = async (): Promise<void> => {
    if (!browser || busy) {
      return;
    }

    busy = true;
    try {
      const blob = await ensureStoryBlob();
      if (!blob) {
        status = "error";
        resetStatus();
        return;
      }

      const saved = await saveStoryToDisk(blob);
      if (saved) {
        status = "downloaded";
        resetStatus();
      }
    } finally {
      busy = false;
    }
  };

  const shareStoryImage = async (): Promise<void> => {
    if (!browser || busy) {
      return;
    }

    busy = true;
    try {
      const blob = await ensureStoryBlob();
      if (!blob) {
        status = "error";
        resetStatus();
        return;
      }

      const shareText = `${share.homeName} ${share.homeScore} - ${share.awayScore} ${share.awayName}`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (typeof navigator.share === "function") {
        const filePayload = {
          title: `${share.homeName} vs ${share.awayName}`,
          text: shareText,
          files: [file],
        };

        if (navigator.canShare?.(filePayload) === true) {
          await navigator.share(filePayload);
          status = "shared";
          resetStatus();
          return;
        }
      }

      const saved = await saveStoryToDisk(blob);
      if (saved) {
        status = "downloaded";
        resetStatus();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      status = "error";
      resetStatus();
    } finally {
      busy = false;
    }
  };

  const openDialog = (): void => {
    status = "idle";
    storyBlob = null;
    dialogEl?.showModal();
    void prefetchStory();
  };

  const handleDialogClose = (): void => {
    busy = false;
    storyBlob = null;
    status = "idle";
  };

  const handleDialogClick = (event: MouseEvent): void => {
    if (event.target === dialogEl) {
      close();
    }
  };
</script>

<div class="flex flex-col items-center gap-1.5">
  <Button
    type="button"
    variant="outline"
    size="sm"
    class="font-pixel gap-2 uppercase active:!translate-x-0 active:!translate-y-0"
    aria-label={t("football.storyOpen")}
    onclick={openDialog}
  >
    <span aria-hidden="true">📱</span>
    {t("football.storyOpen")}
  </Button>

  {#if status !== "idle" && !dialogEl?.open}
    <p
      class={cn(
        "font-pixel text-[7px] uppercase",
        status === "error"
          ? "text-destructive"
          : "text-[var(--ring)]",
      )}
      role="status"
    >
      {statusLabel}
    </p>
  {/if}
</div>

<dialog
  bind:this={dialogEl}
  class="story-dialog pixel-border bg-card fixed top-1/2 left-1/2 z-[200] w-[min(100vw-1.5rem,22rem)] max-w-none -translate-x-1/2 -translate-y-1/2 border-0 p-0 shadow-lg backdrop:bg-background/80"
  aria-labelledby="story-dialog-title"
  onclose={handleDialogClose}
  onclick={handleDialogClick}
>
  <div class="flex max-h-[min(92vh,48rem)] flex-col">
    <div class="border-b-2 border-border p-4">
      <h2
        id="story-dialog-title"
        class="font-pixel text-primary text-[10px] uppercase tracking-wide"
      >
        {t("football.storyTitle")}
      </h2>
      <p class="font-retro text-muted-foreground mt-2 text-xs leading-relaxed">
        {t("football.storyHint")}
      </p>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <p class="font-pixel text-muted-foreground mb-2 text-[7px] uppercase">
        {t("football.storyPreview")}
      </p>
      <div class="pixel-border bg-muted/20 mx-auto w-full max-w-[14rem] p-1">
        <img
          src={storyUrl}
          alt={`${share.homeName} ${share.homeScore} - ${share.awayScore} ${share.awayName}`}
          width="1080"
          height="1920"
          class="block h-auto w-full image-rendering-pixelated"
          loading="eager"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2 border-t-2 border-border p-4">
      <Button
        type="button"
        class={dialogActionClass}
        disabled={busy}
        onclick={() => {
          void downloadStory();
        }}
      >
        {busy ? "…" : t("football.storyDownload")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        class={dialogActionClass}
        disabled={busy}
        onclick={() => {
          void shareStoryImage();
        }}
      >
        {t("football.storyShareImage")}
      </Button>
      <a
        href={storyUrl}
        download={fileName}
        data-sveltekit-reload
        class="font-pixel text-muted-foreground hover:text-foreground text-center text-[7px] uppercase underline underline-offset-2"
      >
        {t("football.storyDirectDownload")}
      </a>
      <Button
        type="button"
        variant="outline"
        class={dialogActionClass}
        disabled={busy}
        onclick={close}
      >
        {t("football.storyClose")}
      </Button>

      {#if status !== "idle"}
        <p
          class={cn(
            "font-pixel text-center text-[7px] uppercase",
            status === "error"
              ? "text-destructive"
              : "text-[var(--ring)]",
          )}
          role="status"
        >
          {statusLabel}
        </p>
      {/if}
    </div>
  </div>
</dialog>

<style>
  .story-dialog {
    margin: 0;
    max-height: min(92vh, 48rem);
  }

  .story-dialog::backdrop {
    background: color-mix(in srgb, var(--background) 82%, transparent);
    backdrop-filter: blur(1px);
  }
</style>