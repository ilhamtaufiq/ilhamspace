<script lang="ts">
  import { cn } from "$lib/utils";

  type Props = {
    class?: string;
    size?: number;
    showInitials?: boolean;
  };

  let { class: className, size = 16, showInitials = false }: Props = $props();

  const width = $derived(showInitials ? Math.round(size * 1.6) : size);
  const height = $derived(size);
  const viewBox = $derived(showInitials ? "0 0 16 10" : "0 0 8 10");
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {viewBox}
  width={width}
  {height}
  shape-rendering="crispEdges"
  class={cn("image-rendering-pixelated shrink-0", className)}
  aria-hidden="true"
>
  <rect x="3" y="0" width="2" height="1" fill="currentColor" />
  <rect x="2" y="1" width="4" height="1" fill="currentColor" />
  <rect x="2" y="2" width="1" height="1" fill="currentColor" />
  <rect x="3" y="2" width="2" height="1" fill="var(--ring)" />
  <rect x="5" y="2" width="1" height="1" fill="currentColor" />
  <rect x="2" y="3" width="1" height="1" fill="currentColor" />
  <rect x="3" y="3" width="2" height="1" fill="var(--ring)" />
  <rect x="5" y="3" width="1" height="1" fill="currentColor" />
  <rect x="1" y="4" width="1" height="1" fill="currentColor" />
  <rect x="2" y="4" width="1" height="1" fill="currentColor" />
  <rect x="3" y="4" width="2" height="1" fill="currentColor" />
  <rect x="5" y="4" width="1" height="1" fill="currentColor" />
  <rect x="6" y="4" width="1" height="1" fill="currentColor" />
  <rect x="2" y="5" width="4" height="1" fill="currentColor" />
  <rect x="2" y="6" width="4" height="1" fill="currentColor" />
  <rect x="3" y="7" width="2" height="1" fill="var(--destructive)" />
  <rect x="2" y="8" width="4" height="1" fill="var(--destructive)" />
  <rect x="3" y="9" width="2" height="1" fill="var(--accent)" />

  {#if showInitials}
    <rect x="9" y="2" width="2" height="1" fill="currentColor" />
    <rect x="10" y="3" width="1" height="5" fill="currentColor" />
    <rect x="9" y="8" width="2" height="1" fill="currentColor" />
    <rect x="12" y="2" width="3" height="1" fill="currentColor" />
    <rect x="12" y="3" width="1" height="1" fill="currentColor" />
    <rect x="14" y="3" width="1" height="1" fill="currentColor" />
    <rect x="12" y="4" width="3" height="1" fill="currentColor" />
    <rect x="14" y="5" width="1" height="1" fill="currentColor" />
    <rect x="12" y="6" width="1" height="1" fill="currentColor" />
    <rect x="12" y="7" width="3" height="1" fill="currentColor" />
  {/if}
</svg>