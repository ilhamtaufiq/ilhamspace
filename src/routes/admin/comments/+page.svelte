<script lang="ts">
  import { IconFilter, IconMessage } from "@tabler/icons-svelte";

  import AdminPagination from "$lib/components/admin/admin-pagination.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import { buildAdminListUrl } from "$lib/admin/pagination";

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

  const statItems = $derived([
    { label: "Total comments", value: String(data.totalItems) },
    { label: "On this page", value: String(data.comments.length) },
    {
      label: "Filter",
      value: data.activePost ? "Active" : "All posts",
    },
    {
      label: "Page",
      value: `${data.page}/${data.totalPages}`,
    },
  ]);

  const rowOffset = $derived((data.page - 1) * data.perPage);
</script>

<PageTitle href="/admin/comments">comments</PageTitle>

<div class="admin-page">
  <header class="admin-hero pixel-border bg-card overflow-hidden">
    <div class="admin-hero__titlebar border-b-2 border-border px-4 py-2.5">
      <p class="type-caption text-primary-foreground">Comments / Moderation</p>
    </div>

    <div class="admin-hero__body p-4 sm:p-6">
      <div class="admin-hero__stack space-y-4">
        <div class="admin-hero__intro min-w-0 w-full">
          <p class="type-body-lg text-balance">
            Review public comments on your notes.
          </p>
          <p class="type-meta mt-2 text-pretty break-words">
            Filter by post, inspect scores, and remove spam or unwanted replies.
          </p>
        </div>

        <form
          method="GET"
          class="admin-hero__toolbar pixel-border bg-muted/20 w-full min-w-0 p-3"
        >
          <div
            class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <div class="min-w-0 w-full flex-1 sm:max-w-md">
              <Label
                for="comment-post-filter"
                class="flex items-center gap-1.5"
              >
                <IconFilter class="size-3.5 shrink-0" aria-hidden="true" />
                Filter by post
              </Label>
              <select
                id="comment-post-filter"
                name="post"
                class="pixel-border bg-background font-retro mt-1 h-9 w-full min-w-0 max-w-full px-2 text-sm"
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
              <Button
                href="/admin/comments"
                variant="outline"
                size="sm"
                class="w-full sm:w-auto"
              >
                Clear
              </Button>
            {/if}
          </div>
        </form>
      </div>

      {#if data.activePost}
        <p class="type-body mt-4 text-pretty">
          Showing comments on
          <a
            href="/notes/{data.activePost.slug}"
            class="text-[var(--ring)] hover:text-accent"
          >
            {data.activePost.title}
          </a>
        </p>
      {/if}

      <dl
        class="mt-6 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-4"
        aria-label="Comments stats"
      >
        {#each statItems as stat (stat.label)}
          <div class="admin-stat pixel-border bg-muted/25 min-w-0 px-3 py-2.5">
            <dt class="type-caption break-words">{stat.label}</dt>
            <dd
              class="font-pixel text-primary mt-1 truncate text-sm uppercase"
            >
              {stat.value}
            </dd>
          </div>
        {/each}
      </dl>
    </div>
  </header>

  <section class="space-y-4" aria-labelledby="admin-comments-list">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="admin-comments-list" class="type-section">Comment queue</h2>
      <Button href="/admin" variant="outline" size="sm">Back to dashboard</Button>
    </div>

    <div class="pixel-border bg-card overflow-hidden">
      {#if form?.deleteError}
        <p
          class="font-pixel text-destructive border-b-2 border-border px-4 py-3 text-[8px] uppercase"
          role="alert"
        >
          {form.deleteError}
        </p>
      {/if}

      {#if data.comments.length === 0}
        <div class="p-6 text-center">
          <span
            class="pixel-border bg-muted/30 mx-auto mb-3 inline-flex size-10 items-center justify-center"
            aria-hidden="true"
          >
            <IconMessage class="text-muted-foreground size-5" />
          </span>
          <p class="font-pixel text-[10px] uppercase">No comments</p>
          <p class="type-meta mt-3 text-pretty">
            Public comments on your notes will appear here.
          </p>
        </div>
      {:else}
        <ul class="divide-y-2 divide-border">
          {#each data.comments as comment, index (comment.id)}
            <li class="admin-list-row px-4 py-4">
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div class="min-w-0 space-y-2">
                  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span
                      class="font-pixel text-muted-foreground text-[8px] uppercase"
                      aria-hidden="true"
                    >
                      {String(rowOffset + index + 1).padStart(2, "0")}
                    </span>
                    <span class="font-retro text-base font-medium">
                      {comment.authorName}
                    </span>
                    <span
                      class="font-pixel text-muted-foreground text-[8px] uppercase"
                    >
                      {comment.authorEmail}
                    </span>
                    {#if comment.parentId}
                      <span
                        class="font-pixel text-[8px] uppercase text-[var(--ring)]"
                      >
                        reply
                      </span>
                    {/if}
                  </div>

                  <p
                    class="type-body text-foreground/90 whitespace-pre-wrap break-words text-sm text-pretty"
                  >
                    {truncateBody(comment.body)}
                  </p>

                  <p class="type-caption">
                    <a
                      href="/notes/{comment.postSlug}#comment-{comment.id}"
                      class="text-[var(--ring)] hover:text-accent"
                    >
                      {comment.postTitle}
                    </a>
                    · score {comment.score} · {formatDate(comment.createdAt)}
                  </p>
                </div>

                <div
                  class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row"
                >
                  <Button
                    href="/notes/{comment.postSlug}#comment-{comment.id}"
                    size="sm"
                    variant="outline"
                    class="w-full sm:w-auto"
                  >
                    View
                  </Button>
                  <form method="POST" action="?/delete" class="w-full sm:w-auto">
                    <input type="hidden" name="id" value={comment.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant="destructive"
                      class="w-full sm:w-auto"
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

        <div class="border-t-2 border-border px-4 py-3">
          <AdminPagination
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            buildUrl={(page) =>
              buildAdminListUrl("/admin/comments", {
                page,
                post: data.filterPostId,
              })}
            label="Comments pages"
            embedded
          />
        </div>
      {/if}
    </div>
  </section>
</div>