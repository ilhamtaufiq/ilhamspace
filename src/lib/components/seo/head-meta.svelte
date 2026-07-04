<script lang="ts">
  import { buildCanonicalUrl, serializeJsonLd, type JsonLd } from "$lib/seo/meta";
  import { siteConfig } from "$lib/config/site";

  type Props = {
    title: string;
    description: string;
    path: string;
    type?: "website" | "article";
    publishedAt?: string;
    modifiedAt?: string;
    noindex?: boolean;
    jsonLd?: JsonLd | JsonLd[];
  };

  let {
    title,
    description,
    path,
    type = "website",
    publishedAt,
    modifiedAt,
    noindex = false,
    jsonLd,
  }: Props = $props();

  const canonicalUrl = $derived(buildCanonicalUrl(path));
  const robots = $derived(noindex ? "noindex, nofollow" : "index, follow");
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content={robots} />
  <link rel="canonical" href={canonicalUrl} />

  <meta property="og:site_name" content={siteConfig.name} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content={type} />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:locale:alternate" content="en_US" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />

  {#if type === "article" && publishedAt}
    <meta property="article:published_time" content={publishedAt} />
  {/if}
  {#if type === "article" && modifiedAt}
    <meta property="article:modified_time" content={modifiedAt} />
  {/if}

  {#if jsonLd}
    {@html `<script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>`}
  {/if}
</svelte:head>