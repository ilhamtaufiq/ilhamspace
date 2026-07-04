import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { getDatabaseUrl } from "$lib/db/path";
import * as schema from "$lib/db/schema";

const client = createClient({
  url: getDatabaseUrl(),
});

export const db = drizzle(client, { schema });
export * from "$lib/db/schema";