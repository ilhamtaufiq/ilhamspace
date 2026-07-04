export type VoteSocketUpdate = {
  commentId: string;
  score: number;
  upvotes: number;
  downvotes: number;
};

type VoteSocketMessage = {
  type: "vote:update";
} & VoteSocketUpdate;

export type CommentVoteSocket = {
  close: () => void;
};

const isVoteUpdate = (value: unknown): value is VoteSocketMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as VoteSocketMessage;
  return (
    message.type === "vote:update" &&
    typeof message.commentId === "string" &&
    typeof message.score === "number" &&
    typeof message.upvotes === "number" &&
    typeof message.downvotes === "number"
  );
};

const buildSocketUrl = (postId: string): string => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return (
    `${protocol}//${window.location.host}/ws/comments` +
    `?postId=${encodeURIComponent(postId)}`
  );
};

export const connectCommentVoteSocket = (
  postId: string,
  onUpdate: (update: VoteSocketUpdate) => void,
): CommentVoteSocket => {
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
        if (isVoteUpdate(data)) {
          onUpdate({
            commentId: data.commentId,
            score: data.score,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
          });
        }
      } catch {
        // Ignore malformed messages.
      }
    });

    activeSocket.addEventListener("close", scheduleReconnect);
  };

  const connect = () => {
    socket = new WebSocket(buildSocketUrl(postId));
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