import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "../src/lib/db/schema.ts";

const getDatabaseUrl = (): string => {
  const path = resolve(process.env.DATABASE_PATH ?? "./data/ilhamspace.db");
  mkdirSync(dirname(path), { recursive: true });
  return `file:${path}`;
};

export const scriptClient = createClient({ url: getDatabaseUrl() });

void scriptClient.execute("PRAGMA foreign_keys = ON");

export const scriptDb = drizzle(scriptClient, { schema });

export { schema };