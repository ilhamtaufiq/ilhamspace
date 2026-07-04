import { z } from "zod";

export const matchChatSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(40, "Name is too long."),
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(300, "Message is too long."),
});

export type MatchChatInput = z.infer<typeof matchChatSchema>;