import "dotenv/config";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

const databasePath = resolve(
  process.env.DATABASE_PATH ?? "./data/ilhamspace.db",
);

mkdirSync(dirname(databasePath), { recursive: true });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${databasePath}`,
  },
});