<script lang="ts">
  import CommentAvatar from "$lib/components/notes/comment-avatar.svelte";
  import CommentForm from "$lib/components/notes/comment-form.svelte";
  import CommentVote from "$lib/components/notes/comment-vote.svelte";
  import Self from "$lib/components/notes/comment-item.svelte";
  import { MAX_COMMENT_DEPTH } from "$lib/comments/constants";
  import { formatCommentTime } from "$lib/comments/format";
  import type { CommentNode } from "$lib/comments/tree";
  import { getLocaleContext } from "$lib/i18n/context";

  type Props = {
    comment: CommentNode;
    depth?: number;
    sort?: string;
    defaultName?: string;
    defaultEmail?: string;
    formError?: string;
    disabled?: boolean;
  };

  let {
    comment,
    depth = 0,
    sort,
    defaultName = "",
    defaultEmail = "",
    formError,
    disabled = false,
  }: Props = $props();

  const { locale, t } = getLocaleContext();
  let replying = $state(false);
  let collapsed = $state(false);

  const timeLabel = $derived(
    formatCommentTime(new Date(comment.createdAt), locale),
  );

  const canReply = $derived(depth < MAX_COMMENT_DEPTH - 1);
  const replyCount = $derived(comment.replies.length);
</script>

<article class="group min-w-0" id="comment-{comment.id}">
  <div class="flex gap-2 sm:gap-3">
    <CommentVote
      commentId={comment.id}
      score={comment.score}
      userVote={comment.userVote}
      {disabled}
    />

    <div class="min-w-0 flex-1">
      <div class="flex gap-2 sm:gap-3">
        <CommentAvatar avatar={comment.avatar} size={depth > 0 ? "sm" : "md"} />

        <div class="min-w-0 flex-1">
          <header class="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span class="type-body font-medium text-foreground">
              {comment.authorName}
            </span>
            <time
              class="type-meta text-sm"
              datetime={comment.createdAt}
              title={comment.createdAt}
            >
              {timeLabel}
            </time>
            {#if replyCount > 0}
              <button
                type="button"
                class="font-pixel text-[8px] uppercase text-muted-foreground hover:text-accent"
                aria-expanded={!collapsed}
                onclick={() => {
                  collapsed = !collapsed;
                }}
              >
                {collapsed
                  ? t("comments.expand", { count: replyCount })
                  : t("comments.collapse")}
              </button>
            {/if}
          </header>

          {#if collapsed}
            <p class="type-meta text-sm italic">
              {t("comments.collapsed", { count: replyCount })}
            </p>
          {:else}
            <p
              class="type-body text-foreground/90 whitespace-pre-wrap break-words"
            >
              {comment.body}
            </p>

            {#if !disabled}
              <div class="mt-2 flex flex-wrap items-center gap-3">
                {#if canReply}
                  <button
                    type="button"
                    class="font-pixel text-[8px] uppercase text-[var(--ring)] hover:text-accent"
                    onclick={() => {
                      replying = !replying;
                    }}
                  >
                    {t("comments.reply")}
                  </button>
                {:else}
                  <span class="type-meta text-xs">
                    {t("comments.maxDepth")}
                  </span>
                {/if}
              </div>
            {/if}

            {#if replying && !disabled && canReply}
              <div class="mt-3 pixel-border bg-card/60 p-3">
                <CommentForm
                  parentId={comment.id}
                  compact
                  {defaultName}
                  {defaultEmail}
                  error={formError}
                  onCancel={() => {
                    replying = false;
                  }}
                />
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  </div>

  {#if !collapsed && comment.replies.length > 0}
    <div
      class="mt-4 space-y-4 border-l-2 border-border/70 pl-3 sm:pl-4"
      style:margin-left={depth === 0 ? "2.25rem" : "1.75rem"}
    >
      {#each comment.replies as reply (reply.id)}
        <Self
          comment={reply}
          depth={depth + 1}
          {sort}
          {defaultName}
          {defaultEmail}
          {formError}
          {disabled}
        />
      {/each}
    </div>
  {/if}
</article>