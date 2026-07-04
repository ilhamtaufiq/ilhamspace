<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  type Variant = "default" | "ghost" | "outline" | "destructive" | "link";
  type Size = "default" | "sm" | "icon";

  type Props = HTMLButtonAttributes & {
    variant?: Variant;
    size?: Size;
    href?: string;
    children: Snippet;
  };

  let {
    variant = "default",
    size = "default",
    href,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const variants: Record<Variant, string> = {
    default:
      "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground",
    ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
    outline: "bg-background hover:bg-muted",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
    link: "border-0 shadow-none bg-transparent text-[var(--ring)] underline underline-offset-4 hover:text-accent active:translate-none",
  };

  const sizes: Record<Size, string> = {
    default: "h-10 px-4",
    sm: "h-8 px-3 text-[8px]",
    icon: "size-10 p-0",
  };

  const classes = $derived(
    cn(
      "font-pixel inline-flex items-center justify-center gap-2",
      "rounded-none pixel-border text-[10px] uppercase",
      "transition-none outline-none",
      "focus-visible:outline-2 focus-visible:outline-offset-2",
      "focus-visible:outline-[var(--ring)]",
      "disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      sizes[size],
      className,
    ),
  );
</script>

{#if href}
  <a {href} class={classes} {...rest as Record<string, unknown>}>
    {@render children()}
  </a>
{:else}
  <button class={classes} {...rest}>
    {@render children()}
  </button>
{/if}