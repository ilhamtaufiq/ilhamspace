<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { formatTagsFromJson } from "$lib/schemas/post";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

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

<div class="mb-4 flex justify-end">
  <Button href="/admin/posts/new">New post</Button>
</div>

{#if data.posts.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">No posts yet</p>
    <p class="font-retro text-muted-foreground mt-2 text-base">
      Create your first note with the Tiptap editor.
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