import type { Server } from "node:http";

import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

export type MatchChatBroadcast = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type ChatMessageEvent = {
  type: "chat:message";
  message: MatchChatBroadcast;
};

const WS_PATH = "/ws/match-chat";
const ROOMS_KEY = Symbol.for("ilhamspace.matchChatRooms");

type RoomStore = Map<string, Set<WebSocket>>;

const getRooms = (): RoomStore => {
  const globalStore = globalThis as typeof globalThis & {
    [ROOMS_KEY]?: RoomStore;
  };
  if (!globalStore[ROOMS_KEY]) {
    globalStore[ROOMS_KEY] = new Map();
  }
  return globalStore[ROOMS_KEY];
};

const roomKey = (matchId: number): string => String(matchId);

const addToRoom = (matchId: number, socket: WebSocket): void => {
  const rooms = getRooms();
  const key = roomKey(matchId);
  let room = rooms.get(key);
  if (!room) {
    room = new Set();
    rooms.set(key, room);
  }

  room.add(socket);
};

const removeFromRoom = (matchId: number, socket: WebSocket): void => {
  const rooms = getRooms();
  const key = roomKey(matchId);
  const room = rooms.get(key);
  if (!room) {
    return;
  }

  room.delete(socket);
  if (room.size === 0) {
    rooms.delete(key);
  }
};

export const attachMatchChatHub = (server: Server): WebSocketServer => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "", "http://localhost");
    if (url.pathname !== WS_PATH) {
      return;
    }

    const matchIdRaw = url.searchParams.get("matchId")?.trim();
    const matchId = matchIdRaw ? Number.parseInt(matchIdRaw, 10) : Number.NaN;
    if (!Number.isFinite(matchId) || matchId <= 0) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      addToRoom(matchId, ws);

      ws.on("close", () => {
        removeFromRoom(matchId, ws);
      });

      ws.on("error", () => {
        removeFromRoom(matchId, ws);
      });

      wss.emit("connection", ws, request);
    });
  });

  return wss;
};

export const broadcastMatchChatMessage = (
  matchId: number,
  message: MatchChatBroadcast,
): void => {
  const room = getRooms().get(roomKey(matchId));
  if (!room || room.size === 0) {
    return;
  }

  const payload: ChatMessageEvent = {
    type: "chat:message",
    message,
  };

  const serialized = JSON.stringify(payload);

  for (const socket of room) {
    if (socket.readyState === socket.OPEN) {
      socket.send(serialized);
    }
  }
};