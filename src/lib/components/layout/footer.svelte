<script lang="ts">
  import { siteConfig } from "$lib/config/site";

  const year = new Date().getFullYear();
</script>

<footer
  class="chrome-footer text-muted-foreground pixel-border-t mt-8 w-full border-t-0 pt-6 text-[8px] leading-loose"
  style="box-shadow: 0 -2px 0 0 var(--border);"
>
  <p class="font-pixel uppercase">
    {siteConfig.name} · © {year} · {siteConfig.license}
  </p>
  <p class="font-pixel mt-2 uppercase">
    <a
      href="/feed.xml"
      class="text-[var(--ring)] no-underline hover:text-accent"
    >
      RSS
    </a>
    <span aria-hidden="true"> · </span>
    <span>{siteConfig.name}</span>
  </p>
</footer>