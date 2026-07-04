<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    document.body.classList.add("note-detail-page");
    return () => {
      document.body.classList.remove("note-detail-page");
    };
  });
</script>

{@render children()}