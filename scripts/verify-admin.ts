import "dotenv/config";

import { compareSync } from "bcryptjs";
import { eq } from "drizzle-orm";

import { schema, scriptDb } from "./db.ts";

const { users } = schema;

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD?.trim();

if (!email) {
  console.error("[verify-admin] Set ADMIN_EMAIL.");
  process.exit(1);
}

const rows = await scriptDb
  .select({
    email: users.email,
    isAdmin: users.isAdmin,
    passwordHash: users.passwordHash,
  })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

const user = rows[0];

if (!user) {
  console.error(`[verify-admin] No user found for ${email}`);
  process.exit(1);
}

console.log(`[verify-admin] User: ${user.email}`);
console.log(`[verify-admin] isAdmin: ${user.isAdmin}`);
console.log(`[verify-admin] hash length: ${user.passwordHash.length}`);

if (!user.isAdmin) {
  console.error("[verify-admin] User exists but isAdmin=false.");
  process.exit(1);
}

if (password) {
  const ok = compareSync(password, user.passwordHash);
  console.log(`[verify-admin] ADMIN_PASSWORD matches: ${ok}`);
  process.exit(ok ? 0 : 1);
}

console.log("[verify-admin] OK (set ADMIN_PASSWORD to test password match).");