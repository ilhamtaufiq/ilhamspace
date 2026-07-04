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

<Badge
  title={loaded && viewsUnavailable ? t("stats.viewsUnavailable") : t("stats.views")}
  class="min-w-[3.25rem] justify-center opacity-80 tabular-nums"
>
  <IconEye class="size-3.5 shrink-0 opacity-65" aria-hidden="true" />
  {loaded ? formatStatCount(views ?? 0) : "—"}
</Badge>

<Badge
  href="/{slug}#comments"
  title={t("stats.comments")}
  class="ml-1 min-w-[3rem] justify-center opacity-80 tabular-nums"
>
  <IconMessages class="size-3.5 shrink-0 opacity-65" aria-hidden="true" />
  {formatStatCount(commentCount)}
</Badge>