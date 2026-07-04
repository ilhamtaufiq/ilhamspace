<script lang="ts">
  import { IconEye, IconMessages } from "@tabler/icons-svelte";
  import { onMount } from "svelte";

  import Badge from "$lib/components/ui/badge.svelte";
  import { getLocaleContext } from "$lib/i18n/context";
  import { formatStatCount } from "$lib/stats/format";
  import { fetchViewCount } from "$lib/stats/views";

  type Props = {
    slug: string;
    commentCount?: number;
  };

  let { slug, commentCount = 0 }: Props = $props();
  const { t } = getLocaleContext();

  let loaded = $state(false);
  let views = $state<number | null>(null);
  let viewsUnavailable = $state(false);

  onMount(() => {
    let cancelled = false;

    fetchViewCount(slug).then((count) => {
      if (cancelled) {
        return;
      }

      viewsUnavailable = count === null;
      views = count ?? 0;
      loaded = true;
    });

    return () => {
      cancelled = true;
    };
  });
</script>

{#if !loaded}
  <span
    class="font-retro inline-block h-5 w-14 animate-pulse pixel-border bg-muted/40 align-middle"
    aria-hidden="true"
  ></span>
  <span
    class="font-retro ml-1 inline-block h-5 w-12 animate-pulse pixel-border bg-muted/40 align-middle"
    aria-hidden="true"
  ></span>
{:else}
  <Badge
    title={viewsUnavailable ? t("stats.viewsUnavailable") : t("stats.views")}
    class="opacity-80"
  >
    <IconEye class="size-3.5 shrink-0 opacity-65" aria-hidden="true" />
    {formatStatCount(views ?? 0)}
  </Badge>

  <Badge href="/{slug}#comments" title={t("stats.comments")} class="ml-1 opacity-80">
    <IconMessages class="size-3.5 shrink-0 opacity-65" aria-hidden="true" />
    {formatStatCount(commentCount)}
  </Badge>
{/if}