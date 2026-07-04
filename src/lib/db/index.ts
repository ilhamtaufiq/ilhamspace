import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { getDatabaseUrl } from "$lib/db/path";
import * as schema from "$lib/db/schema";

const client = createClient({
  url: getDatabaseUrl(),
});

void client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle(client, { schema });
export * from "$lib/db/schema";