<script lang="ts">
  import { enhance } from "$app/forms";
  import { getContext } from "svelte";

  import {
    patchVoteLive,
    VOTE_LIVE_CTX,
    type VoteLiveScores,
  } from "$lib/comments/vote-live-context";
  import type { UserVote } from "$lib/comments/tree";
  import { getLocaleContext } from "$lib/i18n/context";

  type Props = {
    commentId: string;
    score: number;
    userVote: UserVote;
    disabled?: boolean;
  };

  let {
    commentId,
    score,
    userVote,
    disabled = false,
  }: Props = $props();

  const { t } = getLocaleContext();
  const liveScores = getContext<VoteLiveScores | undefined>(VOTE_LIVE_CTX);

  type VoteActionData = {
    vote?: {
      commentId: string;
      score: number;
      upvotes: number;
      downvotes: number;
      userVote: UserVote;
    };
  };

  let localScore = $state(0);
  let localUserVote = $state<UserVote>(null);
  let pending = $state(false);

  $effect(() => {
    if (!pending) {
      localScore = score;
      localUserVote = userVote;
    }
  });

  const remoteScore = $derived(liveScores?.[commentId]?.score);
  const displayScore = $derived(remoteScore ?? localScore);

  $effect(() => {
    if (remoteScore !== undefined && !pending) {
      localScore = remoteScore;
    }
  });

  const applyOptimisticVote = (vote: 1 | -1) => {
    if (localUserVote === vote) {
      localScore -= vote;
      localUserVote = null;
      return;
    }

    if (localUserVote === -vote) {
      localScore += vote * 2;
      localUserVote = vote;
      return;
    }

    localScore += vote;
    localUserVote = vote;
  };

  const upClass = $derived(
    localUserVote === 1
      ? "text-accent"
      : "text-muted-foreground hover:text-accent",
  );

  const downClass = $derived(
    localUserVote === -1
      ? "text-destructive"
      : "text-muted-foreground hover:text-destructive",
  );
</script>

<div class="flex shrink-0 flex-col items-center gap-0.5">
  <form
    method="POST"
    action="?/vote"
    class="flex flex-col items-center gap-0.5 leading-none"
    use:enhance={({ formData }) => {
      const vote = Number(formData.get("vote"));
      const previousScore = localScore;
      const previousUserVote = localUserVote;

      if (vote === 1 || vote === -1) {
        pending = true;
        applyOptimisticVote(vote);
      }

      return async ({ result }) => {
        if (result.type === "failure") {
          localScore = previousScore;
          localUserVote = previousUserVote;
        } else if (result.type === "success") {
          const data = result.data as VoteActionData | undefined;
          if (data?.vote) {
            localScore = data.vote.score;
            localUserVote = data.vote.userVote;

            if (liveScores) {
              patchVoteLive(liveScores, {
                commentId: data.vote.commentId,
                score: data.vote.score,
                upvotes: data.vote.upvotes,
                downvotes: data.vote.downvotes,
              });
            }
          }
        }

        pending = false;
      };
    }}
  >
    <input type="hidden" name="commentId" value={commentId} />

    <button
      type="submit"
      name="vote"
      value="1"
      class="font-pixel text-[10px] leading-none {upClass} disabled:opacity-40"
      aria-label={t("comments.upvote")}
      title={t("comments.upvote")}
      disabled={disabled || pending}
    >
      ▲
    </button>

    <span
      class="font-pixel min-w-[1.25rem] text-center text-[9px] tabular-nums {displayScore >
      0
        ? 'text-accent'
        : displayScore < 0
          ? 'text-destructive'
          : 'text-muted-foreground'}"
      aria-label={t("comments.score", { score: displayScore })}
    >
      {displayScore}
    </span>

    <button
      type="submit"
      name="vote"
      value="-1"
      class="font-pixel text-[10px] leading-none {downClass} disabled:opacity-40"
      aria-label={t("comments.downvote")}
      title={t("comments.downvote")}
      disabled={disabled || pending}
    >
      ▼
    </button>
  </form>
</div>