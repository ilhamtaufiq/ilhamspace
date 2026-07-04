<script lang="ts">
  import { formatStatCount } from "$lib/stats/format";

  type Props = {
    count: number;
  };

  let { count }: Props = $props();
</script>

<span class="opacity-70">
  {formatStatCount(count)}
</span>