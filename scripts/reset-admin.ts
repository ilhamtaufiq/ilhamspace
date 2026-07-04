import "dotenv/config";

import { eq, ne } from "drizzle-orm";

import { db } from "../src/lib/db/index.js";
import { users } from "../src/lib/db/schema.js";

const email = process.env.ADMIN_EMAIL;
const passwordHash = process.env.ADMIN_PASSWORD_HASH;
const name = process.env.ADMIN_NAME ?? "Admin";

if (!email || !passwordHash) {
  console.error("[reset-admin] ADMIN_EMAIL and ADMIN_PASSWORD_HASH required.");
  process.exit(1);
}

await db.delete(users).where(ne(users.email, email));

const existing = await db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

if (existing.length > 0) {
  await db
    .update(users)
    .set({ passwordHash, name, isAdmin: true })
    .where(eq(users.email, email));
  console.log(`[reset-admin] Updated admin: ${email}`);
} else {
  const { randomUUID } = await import("node:crypto");
  await db.insert(users).values({
    id: randomUUID(),
    email,
    passwordHash,
    name,
    isAdmin: true,
  });
  console.log(`[reset-admin] Created admin: ${email}`);
}