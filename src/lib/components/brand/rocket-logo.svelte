<script lang="ts">
  import { cn } from "$lib/utils";

  type Props = {
    class?: string;
    size?: number;
  };

  let { class: className, size = 16 }: Props = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 8 10"
  width={size}
  height={size}
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
</svg>