<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<PageTitle href="/admin">admin</PageTitle>

<div class="space-y-4">
  <p class="font-retro text-lg">
    Welcome, <strong>{data.user.name}</strong>.
  </p>

  <div class="pixel-border bg-card p-4">
    <p class="font-pixel text-[8px] uppercase text-muted-foreground">CMS</p>
    <p class="font-retro mt-2 text-base">
      Write notes with Tiptap and curate your project portfolio from the
      navigation above.
    </p>
  </div>
</div>