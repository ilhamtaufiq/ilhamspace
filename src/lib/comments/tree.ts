import type { CommentAvatar } from "$lib/comments/avatar";
import type { CommentSort } from "$lib/comments/constants";

export type UserVote = 1 | -1 | null;

export type PublicComment = {
  id: string;
  parentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  avatar: CommentAvatar;
  score: number;
  upvotes: number;
  downvotes: number;
  userVote: UserVote;
};

export type CommentNode = PublicComment & {
  replies: CommentNode[];
};

const compareTop = (a: CommentNode, b: CommentNode): number => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

const compareNewRoot = (a: CommentNode, b: CommentNode): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

const compareChronological = (a: CommentNode, b: CommentNode): number =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

const sortNodes = (
  nodes: CommentNode[],
  sort: CommentSort,
  isRoot: boolean,
): CommentNode[] => {
  const compare =
    sort === "top"
      ? compareTop
      : isRoot
        ? compareNewRoot
        : compareChronological;

  return [...nodes]
    .sort(compare)
    .map((node) => ({
      ...node,
      replies: sortNodes(node.replies, sort, false),
    }));
};

export const buildCommentTree = (
  comments: PublicComment[],
  sort: CommentSort = "new",
): CommentNode[] => {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id);
    if (!node) {
      continue;
    }

    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)?.replies.push(node);
      continue;
    }

    roots.push(node);
  }

  return sortNodes(roots, sort, true);
};