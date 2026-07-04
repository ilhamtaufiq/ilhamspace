import type { VoteSocketUpdate } from "$lib/comments/vote-socket";

export const VOTE_LIVE_CTX = Symbol("vote-live");

export type VoteLiveSnapshot = {
  score: number;
  upvotes: number;
  downvotes: number;
};

export type VoteLiveScores = Record<string, VoteLiveSnapshot>;

export const patchVoteLive = (
  scores: VoteLiveScores,
  update: VoteSocketUpdate,
): void => {
  scores[update.commentId] = {
    score: update.score,
    upvotes: update.upvotes,
    downvotes: update.downvotes,
  };
};