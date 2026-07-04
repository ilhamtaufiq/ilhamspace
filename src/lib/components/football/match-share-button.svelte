<script lang="ts">
  import { browser } from "$app/environment";

  import Button from "$lib/components/ui/button.svelte";
  import {
    buildMatchShareMessage,
    type MatchShareInput,
  } from "$lib/football/match-share";
  import { getLocaleContext } from "$lib/i18n/context";
  import { buildCanonicalUrl, buildMatchSharePagePath } from "$lib/seo/meta";
  import { cn } from "$lib/utils";

  type Props = {
    matchId: number;
    share: MatchShareInput;
  };

  let { matchId, share }: Props = $props();

  const { t, locale } = getLocaleContext();

  let status = $state<"idle" | "shared" | "copied" | "error">("idle");

  const message = $derived(buildMatchShareMessage(locale, share));

  const pageUrl = $derived(
    buildCanonicalUrl(
      buildMatchSharePagePath(matchId, {
        homeScore: share.homeScore,
        awayScore: share.awayScore,
        statusShort: share.statusShort,
      }),
    ),
  );

  const shareTitle = $derived(`${share.homeName} vs ${share.awayName}`);

  const statusLabel = $derived(
    status === "shared"
      ? t("football.shareDone")
      : status === "copied"
        ? t("football.shareCopied")
        : status === "error"
          ? t("football.shareError")
          : "",
  );

  const resetStatus = (): void => {
    setTimeout(() => {
      status = "idle";
    }, 2400);
  };

  const shareMatch = async (): Promise<void> => {
    const payload = `${message}\n\n${pageUrl}`;

    if (browser && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: message,
          url: pageUrl,
        });
        status = "shared";
        resetStatus();
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    if (browser && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload);
        status = "copied";
        resetStatus();
        return;
      } catch {
        status = "error";
        resetStatus();
        return;
      }
    }

    status = "error";
    resetStatus();
  };
</script>

<div class="flex flex-col items-center gap-1.5">
  <Button
    type="button"
    variant="outline"
    size="sm"
    class="font-pixel gap-2 uppercase"
    aria-label={t("football.shareMatch")}
    onclick={() => {
      void shareMatch();
    }}
  >
    <span aria-hidden="true">📤</span>
    {t("football.shareMatch")}
  </Button>

  {#if status !== "idle"}
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