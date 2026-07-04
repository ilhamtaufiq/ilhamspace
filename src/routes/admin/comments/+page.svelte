<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Label from "$lib/components/ui/label.svelte";

  import type { ActionData, PageData } from "./$types";

  let {
    data,
    form,
  }: { data: PageData; form: ActionData } = $props();

  const formatDate = (date: Date): string =>
    date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const truncateBody = (body: string, max = 160): string =>
    body.length > max ? `${body.slice(0, max)}…` : body;
</script>

<PageTitle href="/admin/comments">comments</PageTitle>

<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
  <form method="GET" class="flex flex-wrap items-end gap-2">
    <div class="space-y-1">
      <Label for="comment-post-filter">Filter by post</Label>
      <select
        id="comment-post-filter"
        name="post"
        class="pixel-border bg-background font-retro h-9 min-w-[12rem] px-2 text-sm"
        value={data.filterPostId ?? ""}
        onchange={(event) => {
          const form = (event.currentTarget as HTMLSelectElement).form;
          form?.requestSubmit();
        }}
      >
        <option value="">All posts</option>
        {#each data.posts as post (post.id)}
          <option value={post.id}>{post.title}</option>
        {/each}
      </select>
    </div>
    {#if data.filterPostId}
      <Button href="/admin/comments" variant="outline" size="sm">Clear</Button>
    {/if}
  </form>

  <Button href="/admin" variant="outline" size="sm">Back to dashboard</Button>
</div>

{#if form?.deleteError}
  <p class="font-pixel text-destructive mb-4 text-[8px] uppercase" role="alert">
    {form.deleteError}
  </p>
{/if}

{#if data.activePost}
  <p class="font-retro text-muted-foreground mb-4 text-sm">
    Showing comments on
    <a href="/notes/{data.activePost.slug}" class="text-[var(--ring)] underline">
      {data.activePost.title}
    </a>
  </p>
{/if}

{#if data.comments.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">No comments</p>
    <p class="font-retro text-muted-foreground mt-2 text-base">
      Public comments on your notes will appear here.
    </p>
  </div>
{:else}
  <ul class="space-y-3">
    {#each data.comments as comment (comment.id)}
      <li class="pixel-border bg-card p-4">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-0 space-y-2">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span class="font-retro text-base font-medium">
                {comment.authorName}
              </span>
              <span class="font-pixel text-muted-foreground text-[8px] uppercase">
                {comment.authorEmail}
              </span>
              {#if comment.parentId}
                <span class="font-pixel text-[8px] uppercase text-[var(--ring)]">
                  reply
                </span>
              {/if}
            </div>

            <p class="font-retro text-foreground/90 whitespace-pre-wrap break-words text-sm">
              {truncateBody(comment.body)}
            </p>

            <p class="font-pixel text-muted-foreground text-[8px] uppercase">
              <a
                href="/notes/{comment.postSlug}#comment-{comment.id}"
                class="text-[var(--ring)] hover:text-accent"
              >
                {comment.postTitle}
              </a>
              · score {comment.score} · {formatDate(comment.createdAt)}
            </p>
          </div>

          <div class="flex shrink-0 gap-2">
            <Button
              href="/notes/{comment.postSlug}#comment-{comment.id}"
              size="sm"
              variant="outline"
            >
              View
            </Button>
            <form method="POST" action="?/delete">
              <input type="hidden" name="id" value={comment.id} />
              <Button
                type="submit"
                size="sm"
                variant="destructive"
                onclick={(event) => {
                  if (
                    !confirm(
                      "Delete this comment and all replies? This cannot be undone.",
                    )
                  ) {
                    event.preventDefault();
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