<script lang="ts">
  import {
    IconArrowRight,
    IconExternalLink,
    IconNotes,
    IconSoccerField,
    IconStack2,
  } from "@tabler/icons-svelte";

  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { siteConfig } from "$lib/config/site";
  import { buildPageTitle, buildWebsiteJsonLd } from "$lib/seo/meta";
  import { getDateLocale } from "$lib/i18n";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { t } = getLocaleContext();

  const lastUpdatedDisplay = $derived(
    data.stats.lastUpdated
      ? new Date(data.stats.lastUpdated).toLocaleDateString(
          getDateLocale(data.locale),
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        )
      : null,
  );

  const latestPost = $derived(data.recentPosts[0] ?? null);
  const morePosts = $derived(
    latestPost ? data.recentPosts.slice(1) : data.recentPosts,
  );

  const menuTiles = $derived([
    {
      href: "/notes",
      label: t("home.tileNotes"),
      description: t("home.tileNotesDesc"),
      icon: IconNotes,
      accent: "home-tile--notes",
    },
    {
      href: "/projects",
      label: t("home.tileProjects"),
      description: t("home.tileProjectsDesc"),
      icon: IconStack2,
      accent: "home-tile--projects",
    },
    {
      href: "/football/world-cup",
      label: t("home.tileWorldCup"),
      description: t("home.tileWorldCupDesc"),
      icon: IconSoccerField,
      accent: "home-tile--football",
    },
  ]);

  const statItems = $derived([
    { label: t("home.notesCount"), value: String(data.stats.postCount) },
    { label: t("home.projectsCount"), value: String(data.stats.projectCount) },
    {
      label: t("home.lastUpdate"),
      value: lastUpdatedDisplay ?? "—",
    },
  ]);
</script>

<HeadMeta
  title={buildPageTitle(t("seo.homeTitle"))}
  description={t("seo.siteDescription")}
  path="/"
  jsonLd={buildWebsiteJsonLd()}
/>

<div class="home space-y-8">
  <header class="home-hero pixel-border bg-card overflow-hidden">
    <div class="home-hero__titlebar border-b-2 border-border px-4 py-2.5">
      <p class="type-caption text-primary-foreground">{t("home.greeting")}</p>
    </div>

    <div class="home-hero__body p-4 sm:p-6">
      <div
        class="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6"
      >
        <img
          src={siteConfig.logoPath}
          alt={siteConfig.name}
          width={112}
          height={112}
          decoding="async"
          class="pixel-border image-rendering-pixelated size-24 shrink-0 object-cover sm:size-28"
        />

        <div class="min-w-0 flex-1 text-center sm:text-left">
          <h1
            class="font-pixel text-primary text-base uppercase tracking-wide sm:text-lg"
          >
            {siteConfig.name}
          </h1>
          <p class="type-lead mt-2">{siteConfig.tagline}</p>
          <p class="type-body text-foreground/90 mt-3 max-w-prose text-pretty">
            {t("home.intro", { name: siteConfig.name })}
          </p>
        </div>
      </div>

      <dl
        class="home-stats mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3"
        aria-label={t("home.systemStatus")}
      >
        {#each statItems as stat (stat.label)}
          <div class="home-stat pixel-border bg-muted/25 px-3 py-2.5">
            <dt class="type-caption">{stat.label}</dt>
            <dd class="font-pixel text-primary mt-1 text-sm uppercase">
              {stat.value}
            </dd>
          </div>
        {/each}
      </dl>
    </div>
  </header>

  <section class="space-y-3" aria-labelledby="home-quick-nav">
    <h2 id="home-quick-nav" class="type-section">
      {t("home.quickNav")}
    </h2>
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {#each menuTiles as tile (tile.href)}
        {@const TileIcon = tile.icon}
        <li>
          <a
            href={tile.href}
            class={cn(
              "home-tile pixel-border bg-card group flex h-full flex-col gap-2 p-4 no-underline",
              tile.accent,
            )}
          >
            <span
              class="home-tile__icon pixel-border inline-flex size-9 items-center justify-center"
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
              {t("home.tileEnter")}
              <IconArrowRight class="size-3" aria-hidden="true" />
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <div class="grid gap-6 lg:grid-cols-2 lg:items-start">
    <section class="space-y-4" aria-labelledby="home-recent-notes">
      <div class="flex items-center justify-between gap-3">
        <h2 id="home-recent-notes" class="type-section">
          {t("home.recentNotes")}
        </h2>
        <a
          href="/notes"
          class="type-caption text-[var(--ring)] hover:text-accent"
        >
          {t("home.viewAll")}
        </a>
      </div>

      {#if latestPost}
        <article class="home-latest pixel-border bg-card p-4">
          <p class="type-caption text-[var(--ring)]">{t("home.latestNote")}</p>
          <h3 class="type-post-title mt-2">
            <a
              href="/notes/{latestPost.slug}"
              class="text-foreground hover:text-accent no-underline"
            >
              {latestPost.title}
            </a>
          </h3>
          <time
            datetime={latestPost.dateISO}
            class="type-meta mt-2 block text-sm"
          >
            {latestPost.dateDisplay}
          </time>
          <Button href="/notes/{latestPost.slug}" class="mt-4 w-full sm:w-auto">
            {t("home.readLatest")}
          </Button>
        </article>
      {/if}

      {#if morePosts.length > 0}
        <ul class="pixel-border bg-card divide-y-2 divide-border">
          {#each morePosts as post, index (post.slug)}
            <li>
              <a
                href="/notes/{post.slug}"
                class="hover:bg-muted/40 flex items-baseline gap-3 px-4 py-3 no-underline"
              >
                <span
                  class="font-pixel text-muted-foreground w-6 shrink-0 text-[8px] uppercase"
                  aria-hidden="true"
                >
                  {String((latestPost ? index + 2 : index + 1)).padStart(2, "0")}
                </span>
                <span class="type-body-lg text-foreground min-w-0 flex-1">
                  {post.title}
                </span>
                <time
                  datetime={post.dateISO}
                  class="type-meta shrink-0 text-sm"
                >
                  {post.dateDisplay}
                </time>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="pixel-border bg-muted/25 p-5 text-center">
          <p class="type-meta">{t("notes.emptyBody")}</p>
        </div>
      {/if}
    </section>

    <section class="space-y-4" aria-labelledby="home-projects">
      <div class="flex items-center justify-between gap-3">
        <h2 id="home-projects" class="type-section">{t("home.projects")}</h2>
        <a
          href="/projects"
          class="type-caption text-[var(--ring)] hover:text-accent"
        >
          {t("home.viewAll")}
        </a>
      </div>

      {#if data.featuredProjects.length > 0}
        <div class="grid grid-cols-1 gap-3">
          {#each data.featuredProjects as project (project.id)}
            <article class="home-project pixel-border bg-card p-4">
              <div class="flex items-start gap-3">
                {#if project.iconUrl}
                  <img
                    src={project.iconUrl}
                    alt=""
                    class="size-8 shrink-0 rounded-none pixel-border image-rendering-pixelated object-cover"
                    width="32"
                    height="32"
                  />
                {:else}
                  <span
                    class="pixel-border bg-muted/40 inline-flex size-8 shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <IconStack2 class="text-muted-foreground size-4" />
                  </span>
                {/if}
                <div class="min-w-0 flex-1">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-retro inline-flex items-center gap-1.5 text-base font-semibold text-[#0969da] no-underline hover:underline dark:text-[#76affa]"
                  >
                    {project.title}
                    <IconExternalLink
                      class="inline-block size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                  {#if project.description}
                    <p
                      class="type-body text-foreground/85 mt-2 text-sm text-pretty"
                    >
                      {project.description}
                    </p>
                  {/if}
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="pixel-border bg-muted/25 p-5 text-center">
          <p class="type-meta">{t("projects.emptyBody")}</p>
        </div>
      {/if}

      <Button href="/projects" variant="outline" class="w-full sm:w-auto">
        {t("home.viewProjects")}
      </Button>
    </section>
  </div>
</div>

<style>
  .home-hero__titlebar {
    background-color: var(--primary);
  }

  .home-hero__body {
    background-image: radial-gradient(
      color-mix(in srgb, var(--border) 18%, transparent) 1px,
      transparent 1px
    );
    background-size: 12px 12px;
  }

  .home-tile {
    transition:
      background-color 0.12s steps(2),
      border-color 0.12s steps(2),
      transform 0.12s steps(2);
  }

  .home-tile:hover {
    transform: translate(-1px, -1px);
    box-shadow:
      3px 3px 0 0 var(--border),
      inset -1px -1px 0 0 color-mix(in srgb, var(--border) 30%, transparent);
  }

  .home-tile:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }

  .home-tile--notes .home-tile__icon {
    background: color-mix(in srgb, var(--ring) 18%, var(--card));
    color: var(--ring);
  }

  .home-tile--projects .home-tile__icon {
    background: color-mix(in srgb, var(--accent) 22%, var(--card));
    color: var(--primary);
  }

  .home-tile--football .home-tile__icon {
    background: color-mix(in srgb, var(--destructive) 16%, var(--card));
    color: var(--destructive);
  }

  .home-latest {
    background-color: color-mix(in srgb, var(--ring) 8%, var(--card));
  }

  .home-project {
    transition: background-color 0.12s steps(2);
  }

  .home-project:hover {
    background: color-mix(in srgb, var(--muted) 35%, var(--card));
  }
</style>