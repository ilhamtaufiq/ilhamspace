<script lang="ts">
  import type { Snippet } from "svelte";

  import Footer from "$lib/components/layout/footer.svelte";
  import Header from "$lib/components/layout/header.svelte";
  import { siteConfig } from "$lib/config/site";
  import { setLocaleContext } from "$lib/i18n/context";

  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  setLocaleContext(() => data.locale);

  $effect(() => {
    document.documentElement.lang = data.locale;
  });
</script>

<svelte:head>
  <link rel="icon" href="/logo.jpg" type="image/jpeg" />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="{siteConfig.name} RSS"
    href="/feed.xml"
  />
</svelte:head>

<Header isAdmin={data.user?.isAdmin ?? false} />
<main class="page-content w-full">
  {@render children()}
</main>
<Footer />