<script lang="ts">
  import { IconExternalLink } from "@tabler/icons-svelte";

  import Button from "$lib/components/ui/button.svelte";
  import { siteConfig } from "$lib/config/site";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const lastUpdatedDisplay = $derived(
    data.stats.lastUpdated
      ? new Date(data.stats.lastUpdated).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null,
  );
</script>

<section class="space-y-6">
  <div class="space-y-4">
    <h1 class="font-pixel text-sm uppercase leading-snug sm:text-base">
      Hi! Welcome to {siteConfig.name}.
    </h1>

    <div class="prose-retro">
      <p>
        <strong>{siteConfig.name}</strong> is my personal space on the web —
        notes, projects, and ideas in one place.
      </p>
      <p class="text-muted-foreground">{siteConfig.tagline}</p>
    </div>

    <div class="flex flex-wrap gap-3 pt-1">
      <Button href="/notes">Read notes</Button>
      <Button href="/projects" variant="outline">View projects</Button>
    </div>
  </div>

  <div class="pixel-border bg-card p-4">
    <p class="font-pixel text-[8px] uppercase text-muted-foreground">
      System status
    </p>
    <dl class="font-retro mt-3 grid gap-2 text-base sm:grid-cols-3">
      <div>
        <dt class="text-muted-foreground text-sm">Notes</dt>
        <dd class="font-medium">{data.stats.postCount}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground text-sm">Projects</dt>
        <dd class="font-medium">{data.stats.projectCount}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground text-sm">Last update</dt>
        <dd class="font-medium">{lastUpdatedDisplay ?? "—"}</dd>
      </div>
    </dl>
  </div>

  {#if data.recentPosts.length > 0}
    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="font-pixel text-xs uppercase text-primary">Recent notes</h2>
        <a
          href="/notes"
          class="font-pixel text-[8px] uppercase text-[var(--ring)] hover:text-accent"
        >
          View all
        </a>
      </div>
      <ul class="pixel-border bg-card divide-y-2 divide-border">
        {#each data.recentPosts as post (post.slug)}
          <li>
            <a
              href="/notes/{post.slug}"
              class="hover:bg-muted/40 flex items-baseline justify-between gap-3 px-4 py-3 no-underline"
            >
              <span class="font-retro text-lg text-foreground">{post.title}</span>
              <time
                datetime={post.dateISO}
                class="text-muted-foreground shrink-0 font-retro text-sm"
              >
                {post.dateDisplay}
              </time>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if data.featuredProjects.length > 0}
    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="font-pixel text-xs uppercase text-primary">Projects</h2>
        <a
          href="/projects"
          class="font-pixel text-[8px] uppercase text-[var(--ring)] hover:text-accent"
        >
          View all
        </a>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each data.featuredProjects as project (project.id)}
          <article class="pixel-border bg-card h-fit p-4">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              class="font-retro inline-flex items-center gap-1.5 text-base font-semibold text-[#0969da] no-underline hover:underline dark:text-[#76affa]"
            >
              {#if project.iconUrl}
                <img
                  src={project.iconUrl}
                  alt=""
                  class="size-6 shrink-0 rounded-none pixel-border image-rendering-pixelated object-cover"
                  width="24"
                  height="24"
                />
              {/if}
              {project.title}
              <IconExternalLink
                class="inline-block size-3.5 shrink-0"
                aria-hidden="true"
              />
            </a>
            {#if project.description}
              <p
                class="font-retro text-foreground/85 mt-2 text-sm leading-relaxed text-pretty"
              >
                {project.description}
              </p>
            {/if}
          </article>
        {/each}
      </div>
    </section>
  {/if}
</section>