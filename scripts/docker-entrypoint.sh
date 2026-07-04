#!/bin/sh
set -e

export DATABASE_PATH="${DATABASE_PATH:-/app/data/ilhamspace.db}"
db_dir="$(dirname "$DATABASE_PATH")"
mkdir -p "$db_dir"

db_exists=0
if [ -f "$DATABASE_PATH" ] && [ -s "$DATABASE_PATH" ]; then
  db_exists=1
  echo "[entrypoint] Database ready ($(wc -c < "$DATABASE_PATH" | tr -d ' ') bytes)"
else
  echo "[entrypoint] First boot — creating database"
fi

if [ "${RUN_MIGRATIONS:-auto}" != "0" ] && [ "${RUN_MIGRATIONS:-}" != "false" ]; then
  if [ "$db_exists" -eq 0 ] || ! node --import tsx scripts/check-migrations.ts 2>/dev/null; then
    echo "[entrypoint] Running migrations..."
    pnpm exec drizzle-kit migrate
  fi
fi

if [ "${ENSURE_ADMIN:-auto}" != "0" ] && [ "${ENSURE_ADMIN:-}" != "false" ]; then
  if [ -n "${ADMIN_EMAIL:-}" ] && { [ -n "${ADMIN_PASSWORD_HASH:-}" ] || [ -n "${ADMIN_PASSWORD:-}" ]; }; then
    if [ "$db_exists" -eq 0 ] || ! node --import tsx scripts/has-admin.ts 2>/dev/null; then
      echo "[entrypoint] Ensuring admin user..."
      node --import tsx scripts/ensure-admin.ts || true
    fi
  fi
fi

exec node --import tsx server.ts