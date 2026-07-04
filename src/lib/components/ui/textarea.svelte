<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  type Props = HTMLTextareaAttributes & {
    class?: string;
    value?: string;
  };

  let {
    class: className,
    value = $bindable(""),
    ...rest
  }: Props = $props();
</script>

<textarea
  bind:value
  class={cn(
    "font-retro min-h-24 w-full rounded-none pixel-border bg-background px-3",
    "py-2 text-lg text-foreground placeholder:text-muted-foreground",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed",
    "disabled:opacity-50",
    className,
  )}
  {...rest}
></textarea>