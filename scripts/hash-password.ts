import { hashSync } from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: pnpm db:hash-password <plaintext>");
  process.exit(1);
}

const hash = hashSync(password, 12);
console.log(hash);