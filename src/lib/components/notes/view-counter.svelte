<script lang="ts">
  import { onMount } from "svelte";

  import { getLocaleContext } from "$lib/i18n/context";
  import { formatStatCount } from "$lib/stats/format";
  import { fetchViewCount } from "$lib/stats/views";

  type Props = {
    slug: string;
  };

  let { slug }: Props = $props();
  const { t } = getLocaleContext();

  let views = $state<number | null>(null);
  let unavailable = $state(false);

  onMount(() => {
    let cancelled = false;

    fetchViewCount(slug).then((count) => {
      if (cancelled) {
        return;
      }

      if (count === null) {
        unavailable = true;
        views = 0;
        return;
      }

      views = count;
    });

    return () => {
      cancelled = true;
    };
  });
</script>

<span
  class="inline-block min-w-[1.75rem] text-right tabular-nums {views === null
    ? 'opacity-50'
    : 'opacity-70'}"
  title={unavailable ? t("stats.viewsUnavailable") : t("stats.views")}
>
  {views === null ? "—" : formatStatCount(views)}
</span>