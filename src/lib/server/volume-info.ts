import { readFileSync } from "node:fs";

export type VolumeInfo = {
  mounted: boolean;
  mount_root: string | null;
  storage_ok: boolean;
};

export const getVolumeInfo = (dataDir: string): VolumeInfo => {
  try {
    const line = readFileSync("/proc/self/mountinfo", "utf8")
      .split("\n")
      .find((row) => row.split(/\s+/)[4] === dataDir);

    if (!line) {
      return { mounted: false, mount_root: null, storage_ok: false };
    }

    const mountRoot = line.split(/\s+/)[3] ?? null;
    const storageOk = mountRoot?.includes("docker/volumes") === true;

    return {
      mounted: true,
      mount_root: mountRoot,
      storage_ok: storageOk,
    };
  } catch {
    return { mounted: false, mount_root: null, storage_ok: false };
  }
};