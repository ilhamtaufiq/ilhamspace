<script lang="ts">
  import { onMount } from "svelte";

  import { formatStatCount, getPlaceholderPostStats } from "$lib/stats/placeholder";

  type Props = {
    slug: string;
  };

  let { slug }: Props = $props();

  let count = $state<number | null>(null);

  onMount(() => {
    const timer = window.setTimeout(() => {
      count = getPlaceholderPostStats(slug).comments;
    }, 280);

    return () => window.clearTimeout(timer);
  });
</script>

<span
  class={count === null ? "motion-safe:animate-pulse" : "opacity-70"}
  title="Comment counter — coming soon"
>
  {count === null ? "0" : formatStatCount(count)}
</span>