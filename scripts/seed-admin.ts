import "dotenv/config";

import { ensureAdminFromEnv } from "./ensure-admin.js";

const result = await ensureAdminFromEnv();

if (result === "skipped") {
  console.error(
    "[seed] ADMIN_EMAIL and ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD) are required.",
  );
  process.exit(1);
}

console.log(`[seed] Admin user ${result}.`);