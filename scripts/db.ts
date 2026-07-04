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

const client = createClient({ url: getDatabaseUrl() });

void client.execute("PRAGMA foreign_keys = ON");

export const scriptDb = drizzle(client, { schema });

export { schema };