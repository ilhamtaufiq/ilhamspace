<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";

  import type { ActionData, PageData } from "./$types";

  let {
    data,
    form,
  }: { data: PageData; form: ActionData } = $props();

  const formatDate = (date: Date): string =>
    date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const truncateBody = (body: string, max = 100): string =>
    body.length > max ? `${body.slice(0, max)}…` : body;
</script>

<PageTitle href="/admin">admin</PageTitle>

<div class="space-y-6">
  <p class="font-retro text-lg">
    Welcome, <strong>{data.user.name}</strong>.
  </p>

  <div class="grid gap-3 sm:grid-cols-3">
    <div class="pixel-border bg-card p-4">
      <p class="font-pixel text-[8px] uppercase text-muted-foreground">Comments</p>
      <p class="font-retro mt-1 text-2xl font-medium">{data.totalComments}</p>
    </div>
    <div class="pixel-border bg-card p-4">
      <p class="font-pixel text-[8px] uppercase text-muted-foreground">
        Published posts
      </p>
      <p class="font-retro mt-1 text-2xl font-medium">
        {data.publishedPostCount}
      </p>
    </div>
    <div class="pixel-border bg-card p-4">
      <p class="font-pixel text-[8px] uppercase text-muted-foreground">Drafts</p>
      <p class="font-retro mt-1 text-2xl font-medium">{data.draftPostCount}</p>
    </div>
  </div>

  <section class="pixel-border bg-card p-4">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="font-pixel text-[8px] uppercase text-muted-foreground">
          Comment moderation
        </p>
        <p class="font-retro mt-1 text-base">
          Review and remove comments from your notes.
        </p>
      </div>
      <Button href="/admin/comments" size="sm">Manage all</Button>
    </div>

    {#if form?.deleteError}
      <p class="font-pixel text-destructive mb-4 text-[8px] uppercase" role="alert">
        {form.deleteError}
      </p>
    {/if}

    {#if data.recentComments.length === 0}
      <p class="font-retro text-muted-foreground text-sm">No comments yet.</p>
    {:else}
      <ul class="space-y-3">
        {#each data.recentComments as comment (comment.id)}
          <li class="pixel-border bg-background/60 p-3">
            <div
              class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
            >
              <div class="min-w-0 space-y-1">
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span class="font-retro text-sm font-medium">
                    {comment.authorName}
                  </span>
                  <span class="font-pixel text-muted-foreground text-[8px] uppercase">
                    score {comment.score}
                  </span>
                </div>
                <p class="font-retro text-foreground/90 text-sm">
                  {truncateBody(comment.body)}
                </p>
                <p class="font-pixel text-muted-foreground text-[8px] uppercase">
                  <a
                    href="/notes/{comment.postSlug}#comment-{comment.id}"
                    class="text-[var(--ring)] hover:text-accent"
                  >
                    {comment.postTitle}
                  </a>
                  · {formatDate(comment.createdAt)}
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
                <form method="POST" action="?/deleteComment">
                  <input type="hidden" name="id" value={comment.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant="destructive"
                    onclick={(event) => {
                      if (
                        !confirm(
                          "Delete this comment and all replies?",
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
  </section>

  <div class="pixel-border bg-card p-4">
    <p class="font-pixel text-[8px] uppercase text-muted-foreground">CMS</p>
    <p class="font-retro mt-2 text-base">
      Write notes with Tiptap, import posts from WordPress at
      <a href="/admin/posts" class="text-[var(--ring)] underline">Posts</a>,
      and curate your project portfolio from the navigation above.
    </p>
  </div>
</div>