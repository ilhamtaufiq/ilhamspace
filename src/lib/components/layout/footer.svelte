<script lang="ts">
  import LocaleSwitcher from "$lib/components/layout/locale-switcher.svelte";
  import { siteConfig } from "$lib/config/site";

  const year = new Date().getFullYear();
</script>

<footer
  class="chrome-footer type-caption pixel-border-t mt-8 w-full border-t-0 pt-6"
  style="box-shadow: 0 -2px 0 0 var(--border);"
>
  <p>
    {siteConfig.name} · © {year} · {siteConfig.license}
  </p>
  <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
    <p>
      <a
        href="/feed.xml"
        class="text-[var(--ring)] no-underline hover:text-accent"
      >
        RSS
      </a>
      <span aria-hidden="true"> · </span>
      <span>{siteConfig.name}</span>
    </p>
    <LocaleSwitcher />
  </div>
</footer>