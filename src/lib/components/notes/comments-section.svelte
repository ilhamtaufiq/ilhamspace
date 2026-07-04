<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { page } from "$app/stores";

  import CommentForm from "$lib/components/notes/comment-form.svelte";
  import CommentItem from "$lib/components/notes/comment-item.svelte";
  import type { CommentSort } from "$lib/comments/constants";
  import {
    patchVoteLive,
    VOTE_LIVE_CTX,
    type VoteLiveScores,
  } from "$lib/comments/vote-live-context";
  import { connectCommentVoteSocket } from "$lib/comments/vote-socket";
  import { buildCommentTree, type PublicComment } from "$lib/comments/tree";
  import { getLocaleContext } from "$lib/i18n/context";

  type Props = {
    postId: string;
    comments: PublicComment[];
    commentCount: number;
    commentSort: CommentSort;
    commentsDisabled: boolean;
    formError?: string;
    defaultName?: string;
    defaultEmail?: string;
  };

  let {
    postId,
    comments,
    commentCount,
    commentSort,
    commentsDisabled,
    formError,
    defaultName = "",
    defaultEmail = "",
  }: Props = $props();

  const { t } = getLocaleContext();
  const commentTree = $derived(buildCommentTree(comments, commentSort));

  const basePath = $derived($page.url.pathname);

  const liveScores = $state<VoteLiveScores>({});
  setContext(VOTE_LIVE_CTX, liveScores);

  onMount(() => {
    if (commentsDisabled) {
      return;
    }

    const socket = connectCommentVoteSocket(postId, (update) => {
      patchVoteLive(liveScores, update);
    });

    return () => {
      socket.close();
    };
  });
</script>

<section id="comments" class="isolate my-8 w-full border-t-4 border-border pt-8">
  <header class="mb-5 flex flex-wrap items-baseline justify-between gap-2">
    <h2 class="type-section">{t("comments.title")}</h2>
    <p class="type-meta text-sm">
      {t("comments.count", { count: commentCount })}
    </p>
  </header>

  {#if commentsDisabled}
    <div class="pixel-border bg-muted/40 px-4 py-6 text-center">
      <p class="type-body">{t("comments.errorDisabled")}</p>
    </div>
  {:else}
    <div class="pixel-border bg-card mb-6 p-4">
      <CommentForm error={formError} {defaultName} {defaultEmail} />
    </div>

    {#if commentTree.length > 0}
      <nav
        class="mb-4 flex flex-wrap items-center gap-2"
        aria-label={t("comments.sortLabel")}
      >
        <span class="type-meta text-sm">{t("comments.sortLabel")}</span>
        <a
          href="{basePath}?sort=new#comments"
          class="font-pixel border-2 px-2 py-0.5 text-[8px] uppercase no-underline {commentSort ===
          'new'
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}"
          aria-current={commentSort === "new" ? "page" : undefined}
        >
          {t("comments.sortNew")}
        </a>
        <a
          href="{basePath}?sort=top#comments"
          class="font-pixel border-2 px-2 py-0.5 text-[8px] uppercase no-underline {commentSort ===
          'top'
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}"
          aria-current={commentSort === "top" ? "page" : undefined}
        >
          {t("comments.sortTop")}
        </a>
      </nav>
    {/if}

    {#if commentTree.length === 0}
      <p class="type-meta text-center">{t("comments.empty")}</p>
    {:else}
      <div class="space-y-5">
        {#each commentTree as comment (comment.id)}
          <CommentItem
            {comment}
            sort={commentSort}
            {defaultName}
            {defaultEmail}
            {formError}
          />
        {/each}
      </div>
    {/if}
  {/if}
</section>