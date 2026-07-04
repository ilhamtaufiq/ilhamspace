import { execSync } from "node:child_process";

import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const resolveBuildId = () => {
  const fromEnv =
    process.env.BUILD_ID?.trim() ||
    process.env.SOURCE_COMMIT?.trim() ||
    process.env.COOLIFY_COMMIT?.trim();

  if (fromEnv) {
    return fromEnv;
  }

  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: "src/lib",
    },
    version: {
      name: resolveBuildId(),
      pollInterval: 60_000,
    },
  },
};

export default config;