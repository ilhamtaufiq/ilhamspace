import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export const getDatabasePath = (): string => {
  if (process.env.NODE_ENV === "production") {
    return "/app/data/ilhamspace.db";
  }
  return resolve(process.env.DATABASE_PATH ?? "./data/ilhamspace.db");
};

export const getDatabaseUrl = (): string => {
  const path = getDatabasePath();
  mkdirSync(dirname(path), { recursive: true });
  return `file:${path}`;
};