import "dotenv/config";

import { randomUUID } from "node:crypto";

import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";

import { schema, scriptDb } from "./db.ts";

const { users } = schema;

const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const isValidBcryptHash = (hash: string): boolean => BCRYPT_HASH_RE.test(hash);

const resolvePasswordHash = (): string | null => {
  const plain = process.env.ADMIN_PASSWORD?.trim();
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (hash && isValidBcryptHash(hash)) {
    return hash;
  }

  if (hash) {
    console.error(
      `[ensure-admin] ADMIN_PASSWORD_HASH is invalid or truncated (length ${hash.length}, expected 60).`,
    );
    console.error(
      "[ensure-admin] In Coolify/Docker, bcrypt hashes must be fully quoted or use ADMIN_PASSWORD instead.",
    );
  }

  if (plain) {
    return hashSync(plain, 12);
  }

  return null;
};

export const ensureAdminFromEnv = async (): Promise<
  "created" | "updated" | "exists" | "skipped"
> => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = resolvePasswordHash();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  const mode = process.env.ENSURE_ADMIN_MODE?.trim() || "create-only";

  if (!email || !passwordHash) {
    return "skipped";
  }

  const existing = await scriptDb
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    if (mode !== "force" && mode !== "update") {
      return "exists";
    }

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

  if (result === "exists") {
    console.log(
      `[ensure-admin] Admin user already exists for ${process.env.ADMIN_EMAIL} — unchanged`,
    );
  } else {
    console.log(
      `[ensure-admin] Admin user ${result} for ${process.env.ADMIN_EMAIL}`,
    );
  }
}