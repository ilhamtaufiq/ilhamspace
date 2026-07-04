<script lang="ts">
  import { IconExternalLink } from "@tabler/icons-svelte";

  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { siteConfig } from "$lib/config/site";
  import { buildPageTitle, buildWebsiteJsonLd } from "$lib/seo/meta";
  import { getDateLocale } from "$lib/i18n";
  import { getLocaleContext } from "$lib/i18n/context";

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
</script>

<HeadMeta
  title={buildPageTitle(t("seo.homeTitle"))}
  description={t("seo.siteDescription")}
  path="/"
  jsonLd={buildWebsiteJsonLd()}
/>

<section class="space-y-6">
  <div class="space-y-4">
    <h1 class="type-page-title text-base sm:text-base">
      {t("home.welcome", { name: siteConfig.name })}
    </h1>

    <div class="prose-retro">
      <p>
        {t("home.intro", { name: siteConfig.name })}
      </p>
      <p class="text-muted-foreground">{t("home.tagline")}</p>
    </div>

    <div class="flex flex-wrap gap-3 pt-1">
      <Button href="/notes">{t("home.readNotes")}</Button>
      <Button href="/projects" variant="outline">{t("home.viewProjects")}</Button>
    </div>
  </div>

  <div class="pixel-border bg-card p-4">
    <p class="type-caption">{t("home.systemStatus")}</p>
    <dl class="type-body mt-3 grid gap-2 sm:grid-cols-3">
      <div>
        <dt class="type-meta text-sm">{t("home.notesCount")}</dt>
        <dd class="font-medium">{data.stats.postCount}</dd>
      </div>
      <div>
        <dt class="type-meta text-sm">{t("home.projectsCount")}</dt>
        <dd class="font-medium">{data.stats.projectCount}</dd>
      </div>
      <div>
        <dt class="type-meta text-sm">{t("home.lastUpdate")}</dt>
        <dd class="font-medium">{lastUpdatedDisplay ?? "—"}</dd>
      </div>
    </dl>
  </div>

  {#if data.recentPosts.length > 0}
    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="type-section">{t("home.recentNotes")}</h2>
        <a
          href="/notes"
          class="type-caption text-[var(--ring)] hover:text-accent"
        >
          {t("home.viewAll")}
        </a>
      </div>
      <ul class="pixel-border bg-card divide-y-2 divide-border">
        {#each data.recentPosts as post (post.slug)}
          <li>
            <a
              href="/notes/{post.slug}"
              class="hover:bg-muted/40 flex items-baseline justify-between gap-3 px-4 py-3 no-underline"
            >
              <span class="type-body-lg text-foreground">{post.title}</span>
              <time datetime={post.dateISO} class="type-meta shrink-0 text-sm">
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
        <h2 class="type-section">{t("home.projects")}</h2>
        <a
          href="/projects"
          class="type-caption text-[var(--ring)] hover:text-accent"
        >
          {t("home.viewAll")}
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
              <p class="type-body text-foreground/85 mt-2 text-sm text-pretty">
                {project.description}
              </p>
            {/if}
          </article>
        {/each}
      </div>
    </section>
  {/if}
</section>