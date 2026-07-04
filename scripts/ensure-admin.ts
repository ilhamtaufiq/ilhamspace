import "dotenv/config";

import { randomUUID } from "node:crypto";

import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";

import { schema, scriptDb } from "./db.ts";

const { users } = schema;

const resolvePasswordHash = (): string | null => {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) {
    return hash;
  }

  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (plain) {
    return hashSync(plain, 12);
  }

  return null;
};

export const ensureAdminFromEnv = async (): Promise<
  "created" | "updated" | "skipped"
> => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = resolvePasswordHash();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !passwordHash) {
    return "skipped";
  }

  const existing = await scriptDb
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    await scriptDb
      .update(users)
      .set({ passwordHash, name, isAdmin: true })
      .where(eq(users.email, email));

    return "updated";
  }

  await scriptDb.insert(users).values({
    id: randomUUID(),
    email,
    passwordHash,
    name,
    isAdmin: true,
  });

  return "created";
};

const isCli = process.argv[1]?.includes("ensure-admin");
if (isCli) {
  const result = await ensureAdminFromEnv();

  if (result === "skipped") {
    console.log(
      "[ensure-admin] Skipped — set ADMIN_EMAIL and ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD).",
    );
    process.exit(0);
  }

  console.log(
    `[ensure-admin] Admin user ${result} for ${process.env.ADMIN_EMAIL}`,
  );
}