#!/bin/sh
set -e

db_path="${DATABASE_PATH:-/data/ilhamspace.db}"
mkdir -p "$(dirname "$db_path")"

if [ -f "$db_path" ]; then
  db_bytes="$(wc -c < "$db_path" | tr -d ' ')"
  echo "[entrypoint] Database: $db_path (${db_bytes} bytes)"
else
  echo "[entrypoint] WARNING: No database at $db_path — creating a new empty file."
  echo "[entrypoint] Mount a persistent volume to /data in Coolify or data resets every deploy."
fi

echo "[entrypoint] Running database migrations..."
pnpm exec drizzle-kit migrate

if [ -n "${ADMIN_EMAIL:-}" ] && { [ -n "${ADMIN_PASSWORD_HASH:-}" ] || [ -n "${ADMIN_PASSWORD:-}" ]; }; then
  echo "[entrypoint] Ensuring admin user from environment..."
  if ! node --import tsx scripts/ensure-admin.ts; then
    echo "[entrypoint] ERROR: admin provisioning failed — login will not work."
    echo "[entrypoint] Use ADMIN_EMAIL + ADMIN_PASSWORD (plain), or a fully quoted ADMIN_PASSWORD_HASH."
  fi
else
  echo "[entrypoint] Skipping admin provisioning — set ADMIN_EMAIL and ADMIN_PASSWORD."
fi

echo "[entrypoint] Starting server on ${HOST:-0.0.0.0}:${PORT:-3000}..."
exec node --import tsx server.ts