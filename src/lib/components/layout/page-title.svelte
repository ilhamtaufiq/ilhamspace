<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    href: string;
    children: Snippet;
  };

  let { href, children }: Props = $props();
</script>

<h1 class="type-page-title not-prose">
  <a
    {href}
    class="text-foreground before:text-[var(--ring)] no-underline before:content-['>_']"
  >
    {@render children()}
  </a>
</h1>