<script lang="ts">
  import { IconExternalLink } from "@tabler/icons-svelte";

  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import { buildPageTitle } from "$lib/seo/meta";
  import { getLocaleContext } from "$lib/i18n/context";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { t } = getLocaleContext();
</script>

<HeadMeta
  title={buildPageTitle(t("seo.projectsTitle"))}
  description={t("seo.projectsDescription")}
  path="/projects"
/>

<PageTitle href="/projects">{t("projects.title")}</PageTitle>

{#if data.projects.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">{t("projects.emptyTitle")}</p>
    <p class="font-retro text-muted-foreground mt-3 text-base">
      {t("projects.emptyBody")}
    </p>
  </div>
{:else}
  <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
    {#each data.projects as project (project.id)}
      <article class="pixel-border bg-card h-fit space-y-2 p-4">
        <div class="flex items-start gap-3">
          {#if project.iconUrl}
            <img
              src={project.iconUrl}
              alt=""
              class="size-8 shrink-0 rounded-none pixel-border image-rendering-pixelated object-cover"
              width="32"
              height="32"
            />
          {/if}
          <div class="min-w-0 space-y-1.5">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              class="font-retro inline-flex items-center gap-1.5 text-base font-semibold text-[#0969da] hover:underline dark:text-[#76affa]"
            >
              {project.title}
              <IconExternalLink
                class="inline-block size-3.5 shrink-0"
                aria-hidden="true"
              />
            </a>

            {#if project.description}
              <p
                class="font-retro text-foreground/85 text-sm leading-relaxed text-pretty"
              >
                {project.description}
              </p>
            {/if}

            {#if project.language}
              <div
                class="font-retro text-muted-foreground inline-flex items-center gap-1.5 text-xs"
              >
                {#if project.languageColor}
                  <span
                    class="inline-block size-3 rounded-none pixel-border bg-[var(--language-color)]"
                    style={`--language-color: ${project.languageColor}`}
                  ></span>
                {/if}
                <span>{project.language}</span>
              </div>
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>
{/if}