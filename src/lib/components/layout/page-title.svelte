<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    href: string;
    children: Snippet;
  };

  let { href, children }: Props = $props();
</script>

<h1
  class="not-prose font-pixel mt-0 mb-6 text-left text-sm uppercase tracking-wide"
>
  <a
    {href}
    class="text-foreground before:text-[var(--ring)] no-underline before:content-['>_']"
  >
    {@render children()}
  </a>
</h1>