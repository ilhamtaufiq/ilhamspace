<script lang="ts">
  import Footer from "$lib/components/layout/footer.svelte";
  import Header from "$lib/components/layout/header.svelte";
  import { siteConfig } from "$lib/config/site";

  let { children } = $props();
</script>

<svelte:head>
  <title>{siteConfig.name}</title>
  <meta name="description" content={siteConfig.description} />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="{siteConfig.name} RSS"
    href="/feed.xml"
  />
</svelte:head>

<Header />
<main class="page-content w-full">
  {@render children()}
</main>
<Footer />