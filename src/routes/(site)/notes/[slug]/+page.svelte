<script lang="ts">
  import {
    IconCalendarEvent,
    IconEye,
    IconMessages,
    IconTag,
  } from "@tabler/icons-svelte";

  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { buildArticleJsonLd, buildPageTitle } from "$lib/seo/meta";
  import CommentsSection from "$lib/components/notes/comments-section.svelte";
  import CommentCount from "$lib/components/notes/comment-count.svelte";
  import ViewCounter from "$lib/components/notes/view-counter.svelte";
  import { getDateLocale } from "$lib/i18n";
  import { getLocaleContext } from "$lib/i18n/context";
  import { noteTitleTransitionName } from "$lib/navigation/transitions";
  import { parseTagsFromJson } from "$lib/schemas/post";

  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  const { t } = getLocaleContext();
  const dateLocale = $derived(getDateLocale(data.locale));

  const statsSlug = $derived(`notes/${data.post.slug}`);
  const tags = $derived(parseTagsFromJson(data.post.tags));

  const formattedDates = $derived.by(() => {
    const date = data.post.publishedAt;
    if (!date) {
      return null;
    }

    return {
      dateISO: date.toISOString(),
      dateTitle: date.toLocaleString(dateLocale, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      dateDisplay: date.toLocaleDateString(dateLocale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  });
</script>

<HeadMeta
  title={buildPageTitle(data.post.title)}
  description={data.seoDescription}
  path="/notes/{data.post.slug}"
  type="article"
  image={data.seoImage}
  imageAlt={data.post.title}
  publishedAt={data.seoPublishedAt}
  modifiedAt={data.seoModifiedAt}
  jsonLd={buildArticleJsonLd({
    title: data.post.title,
    description: data.seoDescription,
    path: `/notes/${data.post.slug}`,
    publishedAt: data.seoPublishedAt,
    modifiedAt: data.seoModifiedAt,
    image: data.seoImage,
  })}
/>

<div class="note-detail w-full">
  {#if data.canEdit}
    <div class="mb-4 flex justify-end">
      <Button href="/admin/posts/{data.post.id}/edit" variant="outline" size="sm">
        {t("note.editPost")}
      </Button>
    </div>
  {/if}

  {#if formattedDates}
    <div
      class="type-meta mb-4 flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2.5"
    >
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <a
          href="/notes/{data.post.slug}"
          class="flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-inherit no-underline hover:no-underline"
        >
          <IconCalendarEvent
            class="inline size-3.5 shrink-0"
            aria-hidden="true"
          />
          <time datetime={formattedDates.dateISO} title={formattedDates.dateTitle}>
            {formattedDates.dateDisplay}
          </time>
        </a>

        {#if tags.length > 0}
          <div class="flex flex-wrap items-center gap-1.5">
            <IconTag class="inline size-3.5 shrink-0" aria-hidden="true" />
            {#each tags as tag (tag)}
              <span
                title={tag}
                class="mx-px lowercase before:pr-0.5 before:text-foreground/40 before:content-['#'] first-of-type:ml-0 last-of-type:mr-0"
              >
                {tag}
              </span>
            {/each}
          </div>
        {/if}
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <a
          href="/notes/{data.post.slug}#comments"
          class="flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-inherit no-underline hover:no-underline"
        >
          <IconMessages class="inline size-3.5 shrink-0" aria-hidden="true" />
          <CommentCount count={data.commentCount} />
        </a>

        <div
          class="flex min-w-14 flex-nowrap items-center gap-1.5 whitespace-nowrap"
        >
          <IconEye class="inline size-3.5 shrink-0" aria-hidden="true" />
          <ViewCounter slug={statsSlug} />
        </div>
      </div>
    </div>
  {/if}

  <h1
    class="type-post-title my-5 w-full"
    style:view-transition-name={noteTitleTransitionName(data.post.slug)}
  >
    <a
      href="/notes/{data.post.slug}"
      class="text-foreground no-underline hover:no-underline"
    >
      {data.post.title}
    </a>
  </h1>

  {#if data.post.description}
    <p class="type-lead mb-4 w-full text-justify">
      {data.post.description}
    </p>
  {/if}

  <article class="prose-retro note-article markdown w-full text-justify">
    {@html data.post.contentHtml}
  </article>
</div>

<CommentsSection
  postId={data.post.id}
  comments={data.comments}
  commentCount={data.commentCount}
  commentSort={data.commentSort}
  commentsDisabled={data.commentsDisabled}
  formError={form?.commentError}
  defaultName={form?.authorName}
  defaultEmail={form?.authorEmail}
/>