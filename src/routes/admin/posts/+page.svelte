<script lang="ts">
  import { IconPencil, IconUpload } from "@tabler/icons-svelte";

  import AdminPagination from "$lib/components/admin/admin-pagination.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import { buildAdminListUrl } from "$lib/admin/pagination";
  import { formatTagsFromJson } from "$lib/schemas/post";
  import { cn } from "$lib/utils";

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

  const statItems = $derived([
    { label: "Total posts", value: String(data.totalItems) },
    { label: "Published", value: String(data.publishedCount) },
    { label: "Drafts", value: String(data.draftCount) },
    {
      label: "Page",
      value: `${data.page}/${data.totalPages}`,
    },
  ]);

  const rowOffset = $derived((data.page - 1) * data.perPage);
</script>

<PageTitle href="/admin/posts">posts</PageTitle>

<div class="admin-page">
  <header class="admin-hero pixel-border bg-card overflow-hidden">
    <div class="admin-hero__titlebar border-b-2 border-border px-4 py-2.5">
      <p class="type-caption text-primary-foreground">Posts / CMS</p>
    </div>

    <div class="admin-hero__body p-4 sm:p-6">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="admin-hero__intro min-w-0 w-full flex-1">
          <p class="type-body-lg text-balance">Manage your notes and drafts.</p>
          <p class="type-meta mt-2 text-pretty break-words">
            Edit published posts, keep drafts, or import content from WordPress.
          </p>
        </div>
        <Button href="/admin/posts/new" class="w-full shrink-0 gap-2 sm:w-auto">
          <IconPencil class="size-3.5" aria-hidden="true" />
          New post
        </Button>
      </div>

      <dl
        class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
        aria-label="Posts stats"
      >
        {#each statItems as stat (stat.label)}
          <div class="admin-stat pixel-border bg-muted/25 px-3 py-2.5">
            <dt class="type-caption">{stat.label}</dt>
            <dd class="font-pixel text-primary mt-1 text-sm uppercase">
              {stat.value}
            </dd>
          </div>
        {/each}
      </dl>
    </div>
  </header>

  <div
    class="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:items-start"
  >
    <section class="space-y-4" aria-labelledby="admin-posts-list">
      <h2 id="admin-posts-list" class="type-section">All posts</h2>

      <div class="pixel-border bg-card overflow-hidden">
        {#if data.posts.length === 0}
          <div class="p-6 text-center">
            <p class="font-pixel text-[10px] uppercase">No posts yet</p>
            <p class="type-meta mt-3 text-pretty">
              Create your first note with the Tiptap editor or import from
              WordPress.
            </p>
            <Button href="/admin/posts/new" class="mt-4">New post</Button>
          </div>
        {:else}
          <ul class="divide-y-2 divide-border">
            {#each data.posts as post, index (post.id)}
              <li class="admin-list-row px-4 py-3.5">
                <div
                  class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div class="min-w-0 space-y-1.5">
                    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span
                        class="font-pixel text-muted-foreground text-[8px] uppercase"
                        aria-hidden="true"
                      >
                        {String(rowOffset + index + 1).padStart(2, "0")}
                      </span>
                      <a
                        href="/admin/posts/{post.id}/edit"
                        class="type-body-lg text-foreground font-medium no-underline hover:text-accent"
                      >
                        {post.title}
                      </a>
                    </div>
                    <p class="type-caption">
                      <span class="text-[var(--ring)]">/notes/{post.slug}</span>
                      ·
                      <span
                        class={cn(
                          post.status === "published"
                            ? "admin-status--published"
                            : "admin-status--draft",
                        )}
                      >
                        {post.status}
                      </span>
                      · {formatDate(post.updatedAt)}
                    </p>
                    {#if post.tags}
                      <p class="type-meta text-sm">
                        {formatTagsFromJson(post.tags)}
                      </p>
                    {/if}
                  </div>

                  <div class="flex shrink-0 gap-2">
                    <Button
                      href="/admin/posts/{post.id}/edit"
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <form method="POST" action="?/delete">
                      <input type="hidden" name="id" value={post.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="destructive"
                        onclick={(event) => {
                          if (!confirm("Delete this post?")) {
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
              buildUrl={(page) => buildAdminListUrl("/admin/posts", { page })}
              label="Posts pages"
              embedded
            />
          </div>
        {/if}
      </div>
    </section>

    <aside class="space-y-4" aria-labelledby="admin-wordpress-import">
      <h2 id="admin-wordpress-import" class="type-section">
        WordPress import
      </h2>

      <section class="pixel-border bg-card p-4 sm:p-5">
        <div class="flex items-start gap-3">
          <span
            class="pixel-border bg-muted/30 inline-flex size-9 shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            <IconUpload class="size-4 text-[var(--ring)]" stroke={2.5} />
          </span>
          <div class="min-w-0">
            <p class="type-body text-pretty">
              Upload a WordPress export (.xml) from wordpress.com. Imports
              posts, images, and approved comments into notes here.
            </p>
          </div>
        </div>

        <form
          method="POST"
          action="?/importWordPress"
          enctype="multipart/form-data"
          class="mt-4 space-y-3"
        >
          <div class="space-y-1.5">
            <Label for="wordpress-export">WordPress export file</Label>
            <input
              id="wordpress-export"
              name="export"
              type="file"
              accept=".xml,text/xml,application/xml"
              required
              class="font-retro pixel-border bg-background block w-full px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:font-pixel file:text-[8px] file:uppercase"
            />
          </div>
          <Button type="submit" size="sm" class="w-full sm:w-auto">
            Import from WordPress
          </Button>
        </form>

        {#if form?.importError}
          <p
            class="font-pixel text-destructive mt-4 text-[8px] uppercase"
            role="alert"
          >
            {form.importError}
          </p>
        {/if}

        {#if form?.importResult}
          <div class="pixel-border bg-muted/30 mt-4 space-y-2 p-3">
            <p class="type-body text-sm">
              <strong>Posts:</strong>
              {form.importResult.posts.imported} imported,
              {form.importResult.posts.skipped} skipped,
              {form.importResult.posts.failed} failed
            </p>
            <p class="type-body text-sm">
              <strong>Media:</strong>
              {form.importResult.media.imported} downloaded,
              {form.importResult.media.skipped} skipped,
              {form.importResult.media.failed} failed
            </p>
            <p class="type-body text-sm">
              <strong>Comments:</strong>
              {form.importResult.comments.imported} imported,
              {form.importResult.comments.skipped} skipped,
              {form.importResult.comments.failed} failed
            </p>
            {#if form.importResult.errors.length > 0}
              <ul
                class="type-body text-destructive mt-2 list-disc space-y-1 pl-5 text-xs"
              >
                {#each form.importResult.errors as error (error)}
                  <li>{error}</li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}
      </section>
    </aside>
  </div>
</div>