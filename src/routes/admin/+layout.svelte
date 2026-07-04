<script lang="ts">
  import "./admin-fonts.css";

  import AdminNav from "$lib/components/layout/admin-nav.svelte";
  import { siteConfig } from "$lib/config/site";

  let { children } = $props();
</script>

<svelte:head>
  <title>Admin · {siteConfig.name}</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" href="/logo.jpg" type="image/jpeg" />
</svelte:head>

<div class="admin-shell bg-muted/20 -mx-4 space-y-8 px-4 py-4">
  <AdminNav />
  <main class="w-full">
    {@render children()}
  </main>
</div>