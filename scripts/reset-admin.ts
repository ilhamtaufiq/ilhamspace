import "dotenv/config";

import { randomUUID } from "node:crypto";

import { eq, ne } from "drizzle-orm";

import { schema, scriptDb } from "./db.ts";

const { users } = schema;

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
const name = process.env.ADMIN_NAME?.trim() || "Admin";

if (!email || !passwordHash) {
  console.error("[reset-admin] ADMIN_EMAIL and ADMIN_PASSWORD_HASH required.");
  process.exit(1);
}

await scriptDb.delete(users).where(ne(users.email, email));

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
  console.log(`[reset-admin] Updated admin: ${email}`);
} else {
  await scriptDb.insert(users).values({
    id: randomUUID(),
    email,
    passwordHash,
    name,
    isAdmin: true,
  });
  console.log(`[reset-admin] Created admin: ${email}`);
}