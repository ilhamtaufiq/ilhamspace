import { existsSync, readFileSync, statSync } from "node:fs";

import type { RequestHandler } from "./$types";

import { getDatabasePath } from "$lib/db/path";

const isVolumeMounted = (dataDir: string): boolean => {
  try {
    const mounts = readFileSync("/proc/mounts", "utf8");
    return mounts.split("\n").some((line) => {
      const parts = line.split(/\s+/);
      return parts[1] === dataDir;
    });
  } catch {
    return false;
  }
};

const getDeployCount = (dataDir: string): number => {
  try {
    const history = readFileSync(`${dataDir}/.deploy-history`, "utf8");
    return history.trim().split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
};

export const GET: RequestHandler = (): Response => {
  const dbPath = getDatabasePath();
  const dataDir = dbPath.replace(/\/[^/]+$/, "");
  const dbExists = existsSync(dbPath);
  const dbBytes = dbExists ? statSync(dbPath).size : 0;

  return Response.json({
    ok: true,
    db_path: dbPath,
    db_bytes: dbBytes,
    db_exists: dbExists,
    volume_mounted: isVolumeMounted(dataDir),
    deploy_count: getDeployCount(dataDir),
  });
};