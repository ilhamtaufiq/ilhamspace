import type { Server } from "node:http";

import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

export type VoteBroadcast = {
  commentId: string;
  score: number;
  upvotes: number;
  downvotes: number;
};

type VoteUpdateMessage = {
  type: "vote:update";
} & VoteBroadcast;

const WS_PATH = "/ws/comments";
const rooms = new Map<string, Set<WebSocket>>();

const addToRoom = (postId: string, socket: WebSocket): void => {
  let room = rooms.get(postId);
  if (!room) {
    room = new Set();
    rooms.set(postId, room);
  }

  room.add(socket);
};

const removeFromRoom = (postId: string, socket: WebSocket): void => {
  const room = rooms.get(postId);
  if (!room) {
    return;
  }

  room.delete(socket);
  if (room.size === 0) {
    rooms.delete(postId);
  }
};

export const attachCommentVoteHub = (server: Server): WebSocketServer => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "", "http://localhost");
    if (url.pathname !== WS_PATH) {
      return;
    }

    const postId = url.searchParams.get("postId")?.trim();
    if (!postId) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      addToRoom(postId, ws);

      ws.on("close", () => {
        removeFromRoom(postId, ws);
      });

      ws.on("error", () => {
        removeFromRoom(postId, ws);
      });

      wss.emit("connection", ws, request);
    });
  });

  return wss;
};

export const broadcastVoteUpdate = (
  postId: string,
  update: VoteBroadcast,
): void => {
  const room = rooms.get(postId);
  if (!room || room.size === 0) {
    return;
  }

  const payload: VoteUpdateMessage = {
    type: "vote:update",
    ...update,
  };

  const message = JSON.stringify(payload);

  for (const socket of room) {
    if (socket.readyState === socket.OPEN) {
      socket.send(message);
    }
  }
};