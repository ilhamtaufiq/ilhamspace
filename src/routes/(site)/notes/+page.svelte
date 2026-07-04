<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import PostStats from "$lib/components/notes/post-stats.svelte";
  import { noteTitleTransitionName } from "$lib/navigation/transitions";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<PageTitle href="/notes">notes</PageTitle>

{#if data.years.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">No posts yet</p>
    <p class="font-retro text-muted-foreground mt-3 text-base">
      Notes will appear here once you publish from the admin editor.
    </p>
  </div>
{:else}
  {#each data.years as year (year)}
    <section class="my-8 first-of-type:mt-0 last-of-type:mb-0">
      <h2
        id={String(year)}
        class="font-pixel mt-0 mb-4 text-xs uppercase text-primary"
      >
        {year}
      </h2>
      <ul class="space-y-4">
        {#each data.postsByYear[year] as post (post.id)}
          <li class="flex text-sm leading-relaxed">
            <span
              class="text-muted-foreground w-18 shrink-0 font-retro text-base md:w-22"
            >
              <time datetime={post.dateISO} title={post.dateTitle}>
                {post.dateDisplay}
              </time>
            </span>
            <div class="space-x-2">
              <a
                href="/notes/{post.slug}"
                class="font-retro mr-2.5 text-lg underline-offset-4 hover:underline"
                style:view-transition-name={noteTitleTransitionName(post.slug)}
              >
                {post.title}
              </a>
              <PostStats slug="notes/{post.slug}" />
            </div>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
{/if}