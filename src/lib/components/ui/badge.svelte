<script lang="ts">
  import type { Snippet } from "svelte";

  import { cn } from "$lib/utils";

  type Props = {
    href?: string;
    title?: string;
    class?: string;
    children: Snippet;
  };

  let { href, title, class: className, children }: Props = $props();
</script>

{#if href}
  <a
    {href}
    {title}
    class={cn(
      "font-retro inline-flex h-5 items-center gap-1 px-2 text-[11px]",
      "tabular-nums whitespace-nowrap text-foreground/80 no-underline",
      "pixel-border bg-muted/60",
      className,
    )}
  >
    {@render children()}
  </a>
{:else}
  <span
    {title}
    class={cn(
      "font-retro inline-flex h-5 items-center gap-1 px-2 text-[11px]",
      "tabular-nums whitespace-nowrap text-foreground/80",
      "pixel-border bg-muted/60",
      className,
    )}
  >
    {@render children()}
  </span>
{/if}