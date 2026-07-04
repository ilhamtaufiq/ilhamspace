<script lang="ts">
  import type { HTMLLabelAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  type Props = HTMLLabelAttributes & {
    class?: string;
    children: import("svelte").Snippet;
  };

  let { class: className, children, ...rest }: Props = $props();
</script>

<label
  class={cn(
    "font-pixel text-[8px] uppercase tracking-wide text-muted-foreground",
    className,
  )}
  {...rest}
>
  {@render children()}
</label>