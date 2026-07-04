<script lang="ts">
  import { formatStatCount } from "$lib/stats/placeholder";

  type Props = {
    count: number;
  };

  let { count }: Props = $props();
</script>

<span class="opacity-70">
  {formatStatCount(count)}
</span>