<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  type Props = HTMLInputAttributes & {
    class?: string;
    value?: string;
  };

  let {
    class: className,
    value = $bindable(""),
    ...rest
  }: Props = $props();
</script>

<input
  bind:value
  class={cn(
    "font-retro h-10 w-full rounded-none pixel-border bg-background px-3",
    "text-lg text-foreground placeholder:text-muted-foreground",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed",
    "disabled:opacity-50",
    className,
  )}
  {...rest}
/>