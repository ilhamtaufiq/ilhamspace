import type { PublicMatchChatMessage } from "$lib/db/match-chat";

type ChatSocketMessage = {
  type: "chat:message";
  message: PublicMatchChatMessage;
};

export type MatchChatSocket = {
  close: () => void;
};

const isChatMessage = (value: unknown): value is ChatSocketMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as ChatSocketMessage;
  return (
    message.type === "chat:message" &&
    !!message.message &&
    typeof message.message.id === "string" &&
    typeof message.message.authorName === "string" &&
    typeof message.message.body === "string"
  );
};

const buildSocketUrl = (matchId: number): string => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return (
    `${protocol}//${window.location.host}/ws/match-chat` +
    `?matchId=${encodeURIComponent(String(matchId))}`
  );
};

export const connectMatchChatSocket = (
  matchId: number,
  onMessage: (message: PublicMatchChatMessage) => void,
): MatchChatSocket => {
  let socket: WebSocket | undefined;
  let closedByClient = false;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleReconnect = () => {
    if (closedByClient) {
      return;
    }

    retryTimer = setTimeout(connect, 2000);
  };

  const bindSocket = (activeSocket: WebSocket) => {
    activeSocket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(String(event.data)) as unknown;
        if (isChatMessage(data)) {
          onMessage(data.message);
        }
      } catch {
        // Ignore malformed messages.
      }
    });

    activeSocket.addEventListener("close", scheduleReconnect);
  };

  const connect = () => {
    socket = new WebSocket(buildSocketUrl(matchId));
    bindSocket(socket);
  };

  connect();

  return {
    close: () => {
      closedByClient = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      socket?.close();
    },
  };
};