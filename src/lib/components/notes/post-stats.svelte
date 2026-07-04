<script lang="ts">
  import { IconEye, IconMessages } from "@tabler/icons-svelte";
  import { onMount } from "svelte";

  import Badge from "$lib/components/ui/badge.svelte";
  import {
    formatStatCount,
    getPlaceholderPostStats,
  } from "$lib/stats/placeholder";

  type Props = {
    slug: string;
  };

  let { slug }: Props = $props();

  let loaded = $state(false);
  let views = $state(0);
  let comments = $state(0);

  onMount(() => {
    const timer = window.setTimeout(() => {
      const stats = getPlaceholderPostStats(slug);
      views = stats.views;
      comments = stats.comments;
      loaded = true;
    }, 320);

    return () => window.clearTimeout(timer);
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
  <Badge title="Views — coming soon" class="opacity-80">
    <IconEye class="size-3.5 shrink-0 opacity-65" aria-hidden="true" />
    {formatStatCount(views)}
  </Badge>

  <Badge href="/{slug}#comments" title="Comments — coming soon" class="ml-1 opacity-80">
    <IconMessages class="size-3.5 shrink-0 opacity-65" aria-hidden="true" />
    {formatStatCount(comments)}
  </Badge>
{/if}