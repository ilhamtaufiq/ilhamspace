<script lang="ts">
  import {
    IconArrowRight,
    IconMessage,
    IconNotes,
    IconPencil,
    IconSettings,
    IconStack2,
  } from "@tabler/icons-svelte";

  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { cn } from "$lib/utils";

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

  const statItems = $derived([
    { label: "Comments", value: String(data.totalComments) },
    { label: "Published posts", value: String(data.publishedPostCount) },
    { label: "Draft posts", value: String(data.draftPostCount) },
    { label: "Projects", value: String(data.publishedProjectCount) },
  ]);

  const actionTiles = [
    {
      href: "/admin/posts",
      label: "Posts",
      description: "Manage notes and import from WordPress",
      icon: IconNotes,
      accent: "admin-tile--posts",
    },
    {
      href: "/admin/posts/new",
      label: "New post",
      description: "Write with the Tiptap editor",
      icon: IconPencil,
      accent: "admin-tile--new",
    },
    {
      href: "/admin/comments",
      label: "Comments",
      description: "Review and moderate reader comments",
      icon: IconMessage,
      accent: "admin-tile--comments",
    },
    {
      href: "/admin/projects",
      label: "Projects",
      description: "Curate your public portfolio",
      icon: IconStack2,
      accent: "admin-tile--projects",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      description: "Site configuration and preferences",
      icon: IconSettings,
      accent: "admin-tile--settings",
    },
  ] as const;
</script>

<PageTitle href="/admin">admin</PageTitle>

<div class="admin-dashboard space-y-8">
  <header class="admin-hero pixel-border bg-card overflow-hidden">
    <div class="admin-hero__titlebar border-b-2 border-border px-4 py-2.5">
      <p class="type-caption text-primary-foreground">Control panel</p>
    </div>

    <div class="admin-hero__body p-4 sm:p-6">
      <p class="type-body-lg">
        Welcome, <strong class="text-foreground">{data.user.name}</strong>.
      </p>
      <p class="type-meta mt-2 max-w-prose text-pretty">
        Manage notes, comments, and your portfolio from one place.
      </p>

      <dl
        class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
        aria-label="Dashboard stats"
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

  <section class="space-y-3" aria-labelledby="admin-quick-nav">
    <h2 id="admin-quick-nav" class="type-section">Quick actions</h2>
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {#each actionTiles as tile (tile.href)}
        {@const TileIcon = tile.icon}
        <li class={tile.href === "/admin/posts/new" ? "sm:col-span-2 xl:col-span-1" : ""}>
          <a
            href={tile.href}
            class={cn(
              "admin-tile pixel-border bg-card group flex h-full flex-col gap-2 p-4 no-underline",
              tile.accent,
            )}
          >
            <span
              class="admin-tile__icon pixel-border inline-flex size-9 items-center justify-center"
              aria-hidden="true"
            >
              <TileIcon class="size-4" stroke={2.5} />
            </span>
            <span class="font-pixel text-foreground text-[10px] uppercase">
              {tile.label}
            </span>
            <span class="type-body text-muted-foreground text-sm text-pretty">
              {tile.description}
            </span>
            <span
              class="font-pixel text-[var(--ring)] mt-auto inline-flex items-center gap-1 text-[8px] uppercase group-hover:text-accent"
            >
              Open
              <IconArrowRight class="size-3" aria-hidden="true" />
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <div class="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-start">
    <section class="space-y-4" aria-labelledby="admin-comments">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="admin-comments" class="type-section">Comment moderation</h2>
          <p class="type-meta mt-1">Review and remove comments from your notes.</p>
        </div>
        <Button href="/admin/comments" size="sm" variant="outline">
          Manage all
        </Button>
      </div>

      <div class="pixel-border bg-card p-4">
        {#if form?.deleteError}
          <p
            class="font-pixel text-destructive mb-4 text-[8px] uppercase"
            role="alert"
          >
            {form.deleteError}
          </p>
        {/if}

        {#if data.recentComments.length === 0}
          <p class="type-meta">No comments yet.</p>
        {:else}
          <ul class="divide-y-2 divide-border">
            {#each data.recentComments as comment, index (comment.id)}
              <li class="py-3 first:pt-0 last:pb-0">
                <div
                  class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div class="min-w-0 space-y-1.5">
                    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span
                        class="font-pixel text-muted-foreground text-[8px] uppercase"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span class="font-retro text-sm font-medium">
                        {comment.authorName}
                      </span>
                      <span
                        class="font-pixel text-muted-foreground text-[8px] uppercase"
                      >
                        score {comment.score}
                      </span>
                    </div>
                    <p class="type-body text-foreground/90 text-sm text-pretty">
                      {truncateBody(comment.body)}
                    </p>
                    <p class="type-caption">
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
      </div>
    </section>

    <aside class="space-y-4" aria-labelledby="admin-cms">
      <h2 id="admin-cms" class="type-section">CMS overview</h2>

      <div class="pixel-border bg-card space-y-4 p-4">
        <div>
          <p class="type-caption text-[var(--ring)]">Writing</p>
          <p class="type-body mt-2 text-pretty">
            Publish notes with Tiptap, import WordPress exports, and keep drafts
            until they are ready.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button href="/admin/posts/new" size="sm">New post</Button>
            <Button href="/admin/posts" size="sm" variant="outline">
              All posts
            </Button>
          </div>
        </div>

        <div class="border-t-2 border-border pt-4">
          <p class="type-caption text-[var(--ring)]">Portfolio</p>
          <p class="type-body mt-2 text-pretty">
            {data.publishedProjectCount} published
            {data.publishedProjectCount === 1 ? "project" : "projects"} out of
            {data.projectCount} total.
          </p>
          <Button
            href="/admin/projects"
            size="sm"
            variant="outline"
            class="mt-3"
          >
            Manage projects
          </Button>
        </div>

        <div class="border-t-2 border-border pt-4">
          <p class="type-caption text-[var(--ring)]">Public site</p>
          <p class="type-body mt-2 text-pretty">
            Preview the live homepage, notes, and World Cup pages before you sign
            out.
          </p>
          <Button href="/" size="sm" variant="ghost" class="mt-3">
            View site
          </Button>
        </div>
      </div>
    </aside>
  </div>
</div>

<style>
  .admin-hero__titlebar {
    background-color: var(--primary);
  }

  .admin-hero__body {
    background-image: radial-gradient(
      color-mix(in srgb, var(--border) 18%, transparent) 1px,
      transparent 1px
    );
    background-size: 12px 12px;
  }

  .admin-tile {
    transition:
      background-color 0.12s steps(2),
      border-color 0.12s steps(2),
      transform 0.12s steps(2);
  }

  .admin-tile:hover {
    transform: translate(-1px, -1px);
    box-shadow:
      3px 3px 0 0 var(--border),
      inset -1px -1px 0 0 color-mix(in srgb, var(--border) 30%, transparent);
  }

  .admin-tile:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }

  .admin-tile--posts .admin-tile__icon {
    background: color-mix(in srgb, var(--ring) 18%, var(--card));
    color: var(--ring);
  }

  .admin-tile--new .admin-tile__icon {
    background: color-mix(in srgb, var(--accent) 22%, var(--card));
    color: var(--primary);
  }

  .admin-tile--comments .admin-tile__icon {
    background: color-mix(in srgb, var(--destructive) 16%, var(--card));
    color: var(--destructive);
  }

  .admin-tile--projects .admin-tile__icon {
    background: color-mix(in srgb, var(--ring) 12%, var(--card));
    color: var(--foreground);
  }

  .admin-tile--settings .admin-tile__icon {
    background: color-mix(in srgb, var(--muted) 55%, var(--card));
    color: var(--muted-foreground);
  }
</style>