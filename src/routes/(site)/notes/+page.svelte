<script lang="ts">
  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import { buildPageTitle } from "$lib/seo/meta";
  import PostStats from "$lib/components/notes/post-stats.svelte";
  import { getLocaleContext } from "$lib/i18n/context";
  import { noteTitleTransitionName } from "$lib/navigation/transitions";
  import { buildNotesListUrl } from "$lib/posts/notes-list";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { t } = getLocaleContext();

  const pageNumbers = $derived(
    Array.from({ length: data.totalPages }, (_, index) => index + 1),
  );
</script>

<HeadMeta
  title={buildPageTitle(t("seo.notesTitle"))}
  description={t("seo.notesDescription")}
  path="/notes"
/>

<PageTitle href="/notes">{t("notes.title")}</PageTitle>

{#if data.allYears.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">{t("notes.emptyTitle")}</p>
    <p class="font-retro text-muted-foreground mt-3 text-base">
      {t("notes.emptyBody")}
    </p>
  </div>
{:else}
  <nav
    class="mb-6 flex flex-wrap items-center gap-2"
    aria-label={t("notes.filterLabel")}
  >
    <span class="type-meta text-sm">{t("notes.filterLabel")}</span>
    <a
      href={buildNotesListUrl({ year: null })}
      class="font-pixel border-2 px-2 py-0.5 text-[8px] uppercase no-underline {data.filterYear ===
      null
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}"
      aria-current={data.filterYear === null ? "page" : undefined}
    >
      {t("notes.allYears")}
    </a>
    {#each data.allYears as year (year)}
      <a
        href={buildNotesListUrl({ year })}
        class="font-pixel border-2 px-2 py-0.5 text-[8px] uppercase no-underline {data.filterYear ===
        year
          ? 'border-accent bg-accent/15 text-accent'
          : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}"
        aria-current={data.filterYear === year ? "page" : undefined}
      >
        {year}
      </a>
    {/each}
  </nav>

  {#if data.totalPosts === 0}
    <div class="pixel-border bg-muted/40 p-6 text-center">
      <p class="font-pixel text-[10px] uppercase">{t("notes.emptyFilterTitle")}</p>
      <p class="font-retro text-muted-foreground mt-3 text-base">
        {t("notes.emptyFilterBody")}
      </p>
    </div>
  {:else}
    <p class="type-meta mb-4 text-sm">
      {t("notes.resultCount", { count: data.totalPosts })}
    </p>

    {#each data.years as year (year)}
      <section class="my-8 first-of-type:mt-0 last-of-type:mb-0">
        <h2 id={String(year)} class="type-section mt-0 mb-4">
          {year}
        </h2>
        <ul class="space-y-4">
          {#each data.postsByYear[year] as post (post.id)}
            <li class="flex text-sm leading-relaxed">
              <span class="type-meta w-18 shrink-0 md:w-22">
                <time datetime={post.dateISO} title={post.dateTitle}>
                  {post.dateDisplay}
                </time>
              </span>
              <div class="space-x-2">
                <a
                  href="/notes/{post.slug}"
                  class="type-body-lg mr-2.5 underline-offset-4 hover:underline"
                  style:view-transition-name={noteTitleTransitionName(post.slug)}
                >
                  {post.title}
                </a>
                <PostStats
                  slug="notes/{post.slug}"
                  commentCount={data.commentCounts[post.id] ?? 0}
                />
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/each}

    {#if data.totalPages > 1}
      <nav
        class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t-2 border-border pt-4"
        aria-label={t("notes.paginationLabel")}
      >
        <p class="type-meta text-sm">
          {t("notes.pageStatus", {
            page: data.page,
            total: data.totalPages,
          })}
        </p>

        <div class="flex flex-wrap items-center gap-2">
          {#if data.page > 1}
            <a
              href={buildNotesListUrl({
                year: data.filterYear,
                page: data.page - 1,
              })}
              class="font-pixel border-2 border-border px-2 py-0.5 text-[8px] uppercase no-underline text-muted-foreground hover:border-accent hover:text-accent"
            >
              {t("notes.prevPage")}
            </a>
          {/if}

          {#each pageNumbers as pageNumber (pageNumber)}
            <a
              href={buildNotesListUrl({
                year: data.filterYear,
                page: pageNumber,
              })}
              class="font-pixel border-2 px-2 py-0.5 text-[8px] uppercase no-underline {data.page ===
              pageNumber
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}"
              aria-current={data.page === pageNumber ? "page" : undefined}
            >
              {pageNumber}
            </a>
          {/each}

          {#if data.page < data.totalPages}
            <a
              href={buildNotesListUrl({
                year: data.filterYear,
                page: data.page + 1,
              })}
              class="font-pixel border-2 border-border px-2 py-0.5 text-[8px] uppercase no-underline text-muted-foreground hover:border-accent hover:text-accent"
            >
              {t("notes.nextPage")}
            </a>
          {/if}
        </div>
      </nav>
    {/if}
  {/if}
{/if}