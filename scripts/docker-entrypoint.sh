#!/bin/sh
set -e

db_path="${DATABASE_PATH:-/data/ilhamspace.db}"
mkdir -p "$(dirname "$db_path")"

echo "[entrypoint] Running database migrations..."
pnpm exec drizzle-kit migrate

if [ "${SEED_ADMIN:-}" = "1" ]; then
  echo "[entrypoint] Seeding admin user (if missing)..."
  node --import tsx scripts/seed-admin.ts || true
fi

echo "[entrypoint] Starting server on ${HOST:-0.0.0.0}:${PORT:-3000}..."
exec node --import tsx server.ts