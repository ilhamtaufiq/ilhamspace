export const MAX_COMMENT_DEPTH = 4;

export type CommentSort = "new" | "top";

export const parseCommentSort = (value: string | null): CommentSort =>
  value === "top" ? "top" : "new";