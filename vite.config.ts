import type { Server } from "node:http";

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";

import { attachCommentVoteHub } from "./server/comment-vote-hub";
import { attachMatchChatHub } from "./server/match-chat-hub";

const realtimeWebsocket = (): Plugin => ({
  name: "realtime-websocket",
  configureServer(server: ViteDevServer) {
    server.httpServer?.once("listening", () => {
      if (server.httpServer) {
        const httpServer = server.httpServer as Server;
        attachCommentVoteHub(httpServer);
        attachMatchChatHub(httpServer);
      }
    });
  },
});

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), realtimeWebsocket()],
});