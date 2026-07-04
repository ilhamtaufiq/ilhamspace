#!/bin/sh
set -e

export DATABASE_PATH="/app/persist/ilhamspace.db"
mkdir -p /app/persist

if [ -f "$DATABASE_PATH" ] && [ -s "$DATABASE_PATH" ]; then
  echo "[entrypoint] Database ready ($(wc -c < "$DATABASE_PATH" | tr -d ' ') bytes)"
else
  echo "[entrypoint] First boot — creating database"
  if [ -f /app/seed/ilhamspace.db ] && [ -s /app/seed/ilhamspace.db ]; then
    cp /app/seed/ilhamspace.db "$DATABASE_PATH"
  fi
fi

if ! node --import tsx scripts/check-migrations.ts 2>/dev/null; then
  echo "[entrypoint] Running migrations..."
  pnpm exec drizzle-kit migrate
fi

if [ -n "${ADMIN_EMAIL:-}" ] && { [ -n "${ADMIN_PASSWORD_HASH:-}" ] || [ -n "${ADMIN_PASSWORD:-}" ]; }; then
  if ! node --import tsx scripts/has-admin.ts 2>/dev/null; then
    echo "[entrypoint] Ensuring admin user..."
    node --import tsx scripts/ensure-admin.ts || true
  fi
fi

exec node --import tsx server.ts