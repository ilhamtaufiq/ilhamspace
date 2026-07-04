import { randomBytes, randomUUID } from "node:crypto";

import { and, eq, gt } from "drizzle-orm";

import { SESSION_DURATION_MS } from "$lib/auth/constants";
import { db } from "$lib/db/index";
import { sessions, users } from "$lib/db/schema";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export const createSession = async (
  userId: string,
): Promise<{ token: string; expiresAt: Date }> => {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: randomUUID(),
    token,
    userId,
    expiresAt,
  });

  return { token, expiresAt };
};

export const getUserFromSession = async (
  token: string,
): Promise<SessionUser | null> => {
  try {
    const now = new Date();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isAdmin: users.isAdmin,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)))
      .limit(1);

    const user = rows[0];
    if (!user?.isAdmin) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("[auth/session] lookup error:", error);
    return null;
  }
};

export const deleteSession = async (token: string): Promise<void> => {
  try {
    await db.delete(sessions).where(eq(sessions.token, token));
  } catch (error) {
    console.error("[auth/session] delete error:", error);
  }
};