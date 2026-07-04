import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { scriptClient } from "./db.ts";

const journalPath = resolve("drizzle/meta/_journal.json");
const dbPath = resolve(process.env.DATABASE_PATH ?? "/data/db/ilhamspace.db");

const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
  entries: { tag: string }[];
};

const expected = journal.entries.length;

if (!existsSync(dbPath)) {
  console.log(`[check-migrations] No database at ${dbPath} — migrations required`);
  process.exit(2);
}

try {
  const result = await scriptClient.execute(
    "SELECT COUNT(*) AS count FROM __drizzle_migrations",
  );
  const applied = Number(result.rows[0]?.count ?? 0);

  if (applied < expected) {
    console.log(
      `[check-migrations] Pending: ${applied}/${expected} migrations applied`,
    );
    process.exit(2);
  }

  console.log(`[check-migrations] Up to date (${applied}/${expected})`);
  process.exit(0);
} catch {
  console.log("[check-migrations] Migration table missing — migrations required");
  process.exit(2);
}