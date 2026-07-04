<script lang="ts">
  import {
    IconCalendarEvent,
    IconEye,
    IconMessages,
    IconTag,
  } from "@tabler/icons-svelte";

  import CommentCount from "$lib/components/notes/comment-count.svelte";
  import ViewCounter from "$lib/components/notes/view-counter.svelte";
  import { noteTitleTransitionName } from "$lib/navigation/transitions";
  import { parseTagsFromJson } from "$lib/schemas/post";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const statsSlug = $derived(`notes/${data.post.slug}`);
  const tags = $derived(parseTagsFromJson(data.post.tags));

  const formattedDates = $derived.by(() => {
    const date = data.post.publishedAt;
    if (!date) {
      return null;
    }

    return {
      dateISO: date.toISOString(),
      dateTitle: date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      dateDisplay: date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  });
</script>

<svelte:head>
  <title>{data.post.title} · ilhamspace</title>
  {#if data.post.description}
    <meta name="description" content={data.post.description} />
  {/if}
</svelte:head>

{#if formattedDates}
  <div
    class="text-foreground/70 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2.5 font-retro text-[13px] tracking-wide"
  >
    <a
      href="/notes/{data.post.slug}"
      class="flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-inherit no-underline hover:no-underline"
    >
      <IconCalendarEvent class="inline size-3.5 shrink-0" aria-hidden="true" />
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

    <a
      href="/notes/{data.post.slug}#comments"
      class="flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-inherit no-underline hover:no-underline"
    >
      <IconMessages class="inline size-3.5 shrink-0" aria-hidden="true" />
      <CommentCount slug={statsSlug} />
    </a>

    <div
      class="flex min-w-14 flex-nowrap items-center gap-1.5 whitespace-nowrap"
    >
      <IconEye class="inline size-3.5 shrink-0" aria-hidden="true" />
      <ViewCounter slug={statsSlug} />
    </div>
  </div>
{/if}

<h1
  class="font-retro my-5 text-2xl font-medium tracking-tight"
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
  <p class="font-retro text-muted-foreground mb-4 text-lg">
    {data.post.description}
  </p>
{/if}

<article class="prose-retro markdown">
  {@html data.post.contentHtml}
</article>

<section id="comments" class="isolate my-8 w-full border-t-4 border-border pt-8">
  <div class="w-full space-y-6">
    <div class="pixel-border bg-muted/40 flex justify-center px-6 py-12">
      <p class="font-retro text-center text-lg font-medium">
        Comments coming soon.
      </p>
    </div>
  </div>
</section>