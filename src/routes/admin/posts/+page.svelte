<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import { formatTagsFromJson } from "$lib/schemas/post";

  import type { ActionData, PageData } from "./$types";

  let {
    data,
    form,
  }: { data: PageData; form: ActionData } = $props();

  const formatDate = (date: Date | null): string => {
    if (!date) {
      return "—";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
</script>

<PageTitle href="/admin/posts">posts</PageTitle>

<section class="pixel-border bg-card mb-6 space-y-3 p-4">
  <div>
    <h2 class="font-pixel text-[10px] uppercase">Import from WordPress</h2>
    <p class="font-retro text-muted-foreground mt-2 text-sm">
      Upload a WordPress export (.xml) from wordpress.com. Imports posts, images,
      and approved comments into notes here.
    </p>
  </div>

  <form
    method="POST"
    action="?/importWordPress"
    enctype="multipart/form-data"
    class="space-y-3"
  >
    <div class="space-y-1.5">
      <Label for="wordpress-export">WordPress export file</Label>
      <input
        id="wordpress-export"
        name="export"
        type="file"
        accept=".xml,text/xml,application/xml"
        required
        class="font-retro pixel-border bg-background block w-full max-w-md px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:font-pixel file:text-[8px] file:uppercase"
      />
    </div>
    <Button type="submit" size="sm">Import from WordPress</Button>
  </form>

  {#if form?.importError}
    <p class="font-pixel text-destructive text-[8px] uppercase" role="alert">
      {form.importError}
    </p>
  {/if}

  {#if form?.importResult}
    <div class="pixel-border bg-muted/30 space-y-2 p-3">
      <p class="font-retro text-sm">
        <strong>Posts:</strong>
        {form.importResult.posts.imported} imported,
        {form.importResult.posts.skipped} skipped,
        {form.importResult.posts.failed} failed
      </p>
      <p class="font-retro text-sm">
        <strong>Media:</strong>
        {form.importResult.media.imported} downloaded,
        {form.importResult.media.skipped} skipped,
        {form.importResult.media.failed} failed
      </p>
      <p class="font-retro text-sm">
        <strong>Comments:</strong>
        {form.importResult.comments.imported} imported,
        {form.importResult.comments.skipped} skipped,
        {form.importResult.comments.failed} failed
      </p>
      {#if form.importResult.errors.length > 0}
        <ul class="font-retro text-destructive mt-2 list-disc space-y-1 pl-5 text-xs">
          {#each form.importResult.errors as error (error)}
            <li>{error}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</section>

<div class="mb-4 flex justify-end">
  <Button href="/admin/posts/new">New post</Button>
</div>

{#if data.posts.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">No posts yet</p>
    <p class="font-retro text-muted-foreground mt-2 text-base">
      Create your first note with the Tiptap editor or import from WordPress.
    </p>
  </div>
{:else}
  <ul class="space-y-3">
    {#each data.posts as post (post.id)}
      <li class="pixel-border bg-card p-4">
        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-0 space-y-1">
            <a
              href="/admin/posts/{post.id}/edit"
              class="font-retro text-lg font-medium hover:underline"
            >
              {post.title}
            </a>
            <p class="font-pixel text-muted-foreground text-[8px] uppercase">
              /notes/{post.slug} · {post.status} · {formatDate(post.updatedAt)}
            </p>
            {#if post.tags}
              <p class="font-retro text-muted-foreground text-sm">
                {formatTagsFromJson(post.tags)}
              </p>
            {/if}
          </div>
          <div class="flex shrink-0 gap-2">
            <Button href="/admin/posts/{post.id}/edit" size="sm" variant="outline">
              Edit
            </Button>
            <form method="POST" action="?/delete">
              <input type="hidden" name="id" value={post.id} />
              <Button
                type="submit"
                size="sm"
                variant="destructive"
                onclick={(e) => {
                  if (!confirm("Delete this post?")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </Button>
            </form>
          </div>
        </div>
      </li>
    {/each}
  </ul>
{/if}