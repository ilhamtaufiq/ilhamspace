import { createHash } from "node:crypto";

export const getVoterKey = (clientAddress: string): string =>
  createHash("sha256").update(clientAddress).digest("hex");