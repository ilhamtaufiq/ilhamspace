<script lang="ts">
  import TiptapEditor from "$lib/components/editor/tiptap-editor.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import { slugify } from "$lib/editor/slug";

  type PostFormValues = {
    title?: string;
    description?: string;
    tags?: string;
    status?: "draft" | "published";
    contentJson?: string;
    error?: string;
  };

  type Props = {
    action?: string;
    submitLabel?: string;
    values?: PostFormValues;
  };

  let {
    action = "?/save",
    submitLabel = "Save",
    values = {},
  }: Props = $props();

  let title = $state("");
  let description = $state("");
  let tags = $state("");
  let status = $state<"draft" | "published">("draft");
  let editor = $state<TiptapEditor | null>(null);

  const slugPreview = $derived(slugify(title) || "post");

  $effect(() => {
    title = values.title ?? "";
    description = values.description ?? "";
    tags = values.tags ?? "";
    status = values.status ?? "draft";
  });

  const handleSubmit = (event: SubmitEvent): void => {
    const form = event.currentTarget as HTMLFormElement;
    const contentField = form.elements.namedItem(
      "contentJson",
    ) as HTMLInputElement;
    contentField.value = editor?.getJson() ?? "{}";
  };
</script>

<form method="POST" {action} onsubmit={handleSubmit} class="space-y-4">
  {#if values.error}
    <p class="font-pixel text-destructive text-[8px] uppercase" role="alert">
      {values.error}
    </p>
  {/if}

  <input type="hidden" name="contentJson" value="" />

  <div class="space-y-2">
    <Label for="title">Title</Label>
    <Input id="title" name="title" bind:value={title} required />
    <p class="font-pixel text-muted-foreground text-[8px] uppercase">
      URL: /notes/{slugPreview}
    </p>
  </div>

  <div class="space-y-2">
    <Label for="description">Description</Label>
    <Textarea id="description" name="description" bind:value={description} />
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label for="tags">Tags (comma-separated)</Label>
      <Input id="tags" name="tags" bind:value={tags} placeholder="svelte, retro" />
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
  </div>

  <div class="space-y-2">
    <Label>Content</Label>
    <TiptapEditor
      bind:this={editor}
      initialContent={values.contentJson ?? "{}"}
    />
  </div>

  <div class="flex flex-wrap gap-3">
    <Button type="submit">{submitLabel}</Button>
    <Button href="/admin/posts" variant="outline">Cancel</Button>
  </div>
</form>