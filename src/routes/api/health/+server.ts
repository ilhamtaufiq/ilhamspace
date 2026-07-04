import { existsSync, readFileSync, statSync } from "node:fs";

import type { RequestHandler } from "./$types";

import { getDatabasePath } from "$lib/db/path";
import { getVolumeInfo } from "$lib/server/volume-info";

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

  const volumeName =
    volume.mount_root?.match(/\/docker\/volumes\/([^/]+)\/_data$/)?.[1] ?? null;

  return Response.json({
    ok: volume.storage_ok,
    db_path: dbPath,
    db_bytes: dbBytes,
    db_exists: dbExists,
    volume_mounted: volume.mounted,
    volume_name: volumeName,
    mount_root: volume.mount_root,
    storage_type: volume.storage_type,
    storage_ok: volume.storage_ok,
    deploy_count: getDeployCount(dataDir),
  });
};