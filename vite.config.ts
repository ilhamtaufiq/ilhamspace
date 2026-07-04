import type { Server } from "node:http";

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";

import { attachCommentVoteHub } from "./server/comment-vote-hub";

const commentVoteWebsocket = (): Plugin => ({
  name: "comment-vote-websocket",
  configureServer(server: ViteDevServer) {
    server.httpServer?.once("listening", () => {
      if (server.httpServer) {
        attachCommentVoteHub(server.httpServer as Server);
      }
    });
  },
});

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), commentVoteWebsocket()],
});