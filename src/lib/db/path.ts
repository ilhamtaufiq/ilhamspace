import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export const getDatabasePath = (): string => {
  const raw =
    process.env.DATABASE_PATH ??
    (process.env.NODE_ENV === "production"
      ? "/data/db/ilhamspace.db"
      : "./data/ilhamspace.db");
  return resolve(raw);
};

export const getDatabaseUrl = (): string => {
  const path = getDatabasePath();
  mkdirSync(dirname(path), { recursive: true });
  return `file:${path}`;
};