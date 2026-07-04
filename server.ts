import http from "node:http";
import process from "node:process";

import { handler } from "./build/handler.js";
import { attachCommentVoteHub } from "./server/comment-vote-hub";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const server = http.createServer((request, response) => {
  handler(request, response, (error) => {
    if (error) {
      response.statusCode = (error as { status?: number }).status ?? 500;
      response.end((error as { message?: string }).message ?? "Internal Error");
      return;
    }

    response.statusCode = 404;
    response.end("Not found");
  });
});

attachCommentVoteHub(server);

server.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`);
});