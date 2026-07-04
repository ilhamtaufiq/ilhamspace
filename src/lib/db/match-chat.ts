import { randomUUID } from "node:crypto";

import { desc, eq } from "drizzle-orm";

import { db } from "$lib/db/index";
import { matchChatMessages } from "$lib/db/schema";

export type PublicMatchChatMessage = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

const toPublic = (row: typeof matchChatMessages.$inferSelect): PublicMatchChatMessage => ({
  id: row.id,
  authorName: row.authorName,
  body: row.body,
  createdAt: row.createdAt.toISOString(),
});

export const getMatchChatMessages = async (
  matchId: number,
  limit = 80,
): Promise<PublicMatchChatMessage[]> => {
  const rows = await db
    .select()
    .from(matchChatMessages)
    .where(eq(matchChatMessages.matchId, matchId))
    .orderBy(desc(matchChatMessages.createdAt))
    .limit(limit);

  return rows.reverse().map(toPublic);
};

export const createMatchChatMessage = async (input: {
  matchId: number;
  authorName: string;
  body: string;
}): Promise<PublicMatchChatMessage> => {
  const id = randomUUID();
  const now = new Date();

  await db.insert(matchChatMessages).values({
    id,
    matchId: input.matchId,
    authorName: input.authorName,
    body: input.body,
    createdAt: now,
  });

  return {
    id,
    authorName: input.authorName,
    body: input.body,
    createdAt: now.toISOString(),
  };
};