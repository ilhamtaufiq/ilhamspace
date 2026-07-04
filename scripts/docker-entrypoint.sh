#!/bin/sh
set -e

db_path="${DATABASE_PATH:-/data/ilhamspace.db}"
mkdir -p "$(dirname "$db_path")"

echo "[entrypoint] Running database migrations..."
pnpm exec drizzle-kit migrate

if [ -n "${ADMIN_EMAIL:-}" ] && { [ -n "${ADMIN_PASSWORD_HASH:-}" ] || [ -n "${ADMIN_PASSWORD:-}" ]; }; then
  echo "[entrypoint] Ensuring admin user from environment..."
  node --import tsx scripts/ensure-admin.ts
fi

echo "[entrypoint] Starting server on ${HOST:-0.0.0.0}:${PORT:-3000}..."
exec node --import tsx server.ts