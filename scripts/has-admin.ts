import { eq } from "drizzle-orm";

import { schema, scriptDb } from "./db.ts";

const { users } = schema;

const rows = await scriptDb
  .select({ id: users.id })
  .from(users)
  .where(eq(users.isAdmin, true))
  .limit(1);

if (rows.length > 0) {
  console.log("[has-admin] Admin user found");
  process.exit(0);
}

console.log("[has-admin] No admin user");
process.exit(1);