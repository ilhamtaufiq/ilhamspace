import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export const getDatabasePath = (): string => {
  const raw = process.env.DATABASE_PATH ?? "./data/ilhamspace.db";
  return resolve(raw);
};

export const getDatabaseUrl = (): string => {
  const path = getDatabasePath();
  mkdirSync(dirname(path), { recursive: true });
  return `file:${path}`;
};