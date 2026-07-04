import "dotenv/config";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "../src/lib/db/index.js";
import { users } from "../src/lib/db/schema.js";

const email = process.env.ADMIN_EMAIL;
const passwordHash = process.env.ADMIN_PASSWORD_HASH;
const name = process.env.ADMIN_NAME ?? "Admin";

if (!email || !passwordHash) {
  console.error(
    "[seed] ADMIN_EMAIL and ADMIN_PASSWORD_HASH are required.",
  );
  process.exit(1);
}

const existing = await db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

if (existing.length > 0) {
  console.log("[seed] Admin user already exists — skipping.");
  process.exit(0);
}

await db.insert(users).values({
  id: randomUUID(),
  email,
  passwordHash,
  name,
  isAdmin: true,
});

console.log(`[seed] Admin user created for ${email}`);