<script lang="ts">
  import { onMount } from "svelte";

  import { formatStatCount, getPlaceholderPostStats } from "$lib/stats/placeholder";

  type Props = {
    slug: string;
  };

  let { slug }: Props = $props();

  let views = $state<number | null>(null);

  onMount(() => {
    const timer = window.setTimeout(() => {
      views = getPlaceholderPostStats(slug).views;
    }, 280);

    return () => window.clearTimeout(timer);
  });
</script>

<span
  class={views === null ? "motion-safe:animate-pulse" : "opacity-70"}
  title="View counter — coming soon"
>
  {views === null ? "0" : formatStatCount(views)}
</span>