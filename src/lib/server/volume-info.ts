import { readFileSync } from "node:fs";

export type VolumeInfo = {
  mounted: boolean;
  mount_root: string | null;
  volume_name: string | null;
  storage_ok: boolean;
  storage_type: "docker_volume" | "bind" | "missing";
};

export const getVolumeInfo = (dataDir: string): VolumeInfo => {
  try {
    const line = readFileSync("/proc/self/mountinfo", "utf8")
      .split("\n")
      .find((row) => row.split(/\s+/)[4] === dataDir);

    if (!line) {
      return {
        mounted: false,
        mount_root: null,
        volume_name: null,
        storage_ok: false,
        storage_type: "missing",
      };
    }

    const mountRoot = line.split(/\s+/)[3] ?? null;
    const volumeName =
      mountRoot?.match(/\/docker\/volumes\/([^/]+)\/_data$/)?.[1] ?? null;

    if (mountRoot?.includes("docker/volumes") === true) {
      return {
        mounted: true,
        mount_root: mountRoot,
        volume_name: volumeName,
        storage_ok: true,
        storage_type: "docker_volume",
      };
    }

    if (mountRoot === "/") {
      return {
        mounted: true,
        mount_root: mountRoot,
        volume_name: null,
        storage_ok: false,
        storage_type: "bind",
      };
    }

    return {
      mounted: true,
      mount_root: mountRoot,
      volume_name: null,
      storage_ok: true,
      storage_type: "bind",
    };
  } catch {
    return {
      mounted: false,
      mount_root: null,
      volume_name: null,
      storage_ok: false,
      storage_type: "missing",
    };
  }
};