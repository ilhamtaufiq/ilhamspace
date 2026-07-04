import { existsSync, readFileSync, statSync } from "node:fs";

import type { RequestHandler } from "./$types";

import { getDatabasePath } from "$lib/db/path";

const getVolumeInfo = (
  dataDir: string,
): { mounted: boolean; mount_source: string | null; storage_ok: boolean } => {
  try {
    const line = readFileSync("/proc/mounts", "utf8")
      .split("\n")
      .find((row) => row.split(/\s+/)[1] === dataDir);

    if (!line) {
      return { mounted: false, mount_source: null, storage_ok: false };
    }

    const mountSource = line.split(/\s+/)[0] ?? null;
    const blocked =
      mountSource?.startsWith("/dev/sda") === true ||
      mountSource?.startsWith("/dev/") === true;

    return {
      mounted: true,
      mount_source: mountSource,
      storage_ok: !blocked,
    };
  } catch {
    return { mounted: false, mount_source: null, storage_ok: false };
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

  const volume = getVolumeInfo(dataDir);

  return Response.json({
    ok: volume.storage_ok,
    db_path: dbPath,
    db_bytes: dbBytes,
    db_exists: dbExists,
    volume_mounted: volume.mounted,
    mount_source: volume.mount_source,
    storage_ok: volume.storage_ok,
    deploy_count: getDeployCount(dataDir),
  });
};