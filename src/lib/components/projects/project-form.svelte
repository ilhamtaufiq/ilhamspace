<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";

  type ProjectFormValues = {
    title?: string;
    description?: string;
    url?: string;
    iconUrl?: string;
    language?: string;
    languageColor?: string;
    sortOrder?: number;
    status?: "draft" | "published";
    error?: string;
  };

  type Props = {
    action?: string;
    submitLabel?: string;
    values?: ProjectFormValues;
  };

  let {
    action = "?/save",
    submitLabel = "Save",
    values = {},
  }: Props = $props();

  let title = $state("");
  let description = $state("");
  let url = $state("");
  let iconUrl = $state("");
  let language = $state("");
  let languageColor = $state("");
  let sortOrder = $state("0");
  let status = $state<"draft" | "published">("draft");

  $effect(() => {
    title = values.title ?? "";
    description = values.description ?? "";
    url = values.url ?? "";
    iconUrl = values.iconUrl ?? "";
    language = values.language ?? "";
    languageColor = values.languageColor ?? "";
    sortOrder = String(values.sortOrder ?? 0);
    status = values.status ?? "draft";
  });
</script>

<form method="POST" {action} class="space-y-4">
  {#if values.error}
    <p class="font-pixel text-destructive text-[8px] uppercase" role="alert">
      {values.error}
    </p>
  {/if}

  <div class="space-y-2">
    <Label for="title">Title</Label>
    <Input id="title" name="title" bind:value={title} required />
  </div>

  <div class="space-y-2">
    <Label for="url">URL</Label>
    <Input
      id="url"
      name="url"
      type="url"
      bind:value={url}
      placeholder="https://github.com/you/project"
      required
    />
  </div>

  <div class="space-y-2">
    <Label for="description">Description</Label>
    <Textarea id="description" name="description" bind:value={description} />
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label for="iconUrl">Icon URL (optional)</Label>
      <Input
        id="iconUrl"
        name="iconUrl"
        type="url"
        bind:value={iconUrl}
        placeholder="https://..."
      />
    </div>
    <div class="space-y-2">
      <Label for="sortOrder">Sort order</Label>
      <Input
        id="sortOrder"
        name="sortOrder"
        type="number"
        min="0"
        bind:value={sortOrder}
      />
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label for="language">Language (optional)</Label>
      <Input
        id="language"
        name="language"
        bind:value={language}
        placeholder="TypeScript"
      />
    </div>
    <div class="space-y-2">
      <Label for="languageColor">Language color (optional)</Label>
      <Input
        id="languageColor"
        name="languageColor"
        bind:value={languageColor}
        placeholder="#3178C6"
        pattern="#[0-9A-Fa-f]{6}"
      />
    </div>
  </div>

  <div class="space-y-2">
    <Label for="status">Status</Label>
    <select
      id="status"
      name="status"
      bind:value={status}
      class="font-retro h-10 w-full rounded-none pixel-border bg-background px-3 text-lg"
    >
      <option value="draft">Draft</option>
      <option value="published">Published</option>
    </select>
  </div>

  <div class="flex flex-wrap gap-3">
    <Button type="submit">{submitLabel}</Button>
    <Button href="/admin/projects" variant="outline">Cancel</Button>
  </div>
</form>