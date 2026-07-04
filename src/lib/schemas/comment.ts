import { z } from "zod";

export const commentSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name is too long."),
  authorEmail: z.email("Invalid email address."),
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty.")
    .max(2000, "Comment is too long."),
  parentId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const voteSchema = z.object({
  commentId: z.string().trim().min(1),
  vote: z.coerce
    .number()
    .int()
    .refine((value) => value === 1 || value === -1, "Invalid vote."),
});

export type VoteInput = z.infer<typeof voteSchema>;