<script lang="ts">
  import type { CommentAvatar } from "$lib/comments/avatar";
  import { cn } from "$lib/utils";

  type Props = {
    avatar: CommentAvatar;
    size?: "sm" | "md";
    class?: string;
  };

  let { avatar, size = "md", class: className }: Props = $props();

  const sizeClass = $derived(size === "sm" ? "size-8 text-lg" : "size-10 text-xl");
</script>

<span
  class={cn(
    "pixel-border inline-flex shrink-0 items-center justify-center",
    "leading-none select-none",
    sizeClass,
    className,
  )}
  style:background-color={avatar.background}
  aria-hidden="true"
>
  {avatar.emoji}
</span>