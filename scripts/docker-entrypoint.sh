#!/bin/sh
set -e

export DATABASE_PATH="/app/data/ilhamspace.db"
mkdir -p /app/data

mount_root="$(awk -v mp="/app/data" '$5 == mp { print $4; exit }' /proc/self/mountinfo 2>/dev/null || true)"
if [ -n "$mount_root" ] && [ "$mount_root" != "/" ]; then
  echo "[entrypoint] Storage: $mount_root"
else
  echo "[entrypoint] WARN: /app/data not mounted"
fi

if [ ! -f "$DATABASE_PATH" ] || [ ! -s "$DATABASE_PATH" ]; then
  if [ -f /app/ilhamspace.db ] && [ -s /app/ilhamspace.db ]; then
    cp /app/ilhamspace.db "$DATABASE_PATH"
    echo "[entrypoint] Seeded database from image"
  else
    echo "[entrypoint] First boot — creating database"
  fi
elif [ -f "$DATABASE_PATH" ] && [ -s "$DATABASE_PATH" ]; then
  echo "[entrypoint] Database ready ($(wc -c < "$DATABASE_PATH" | tr -d ' ') bytes)"
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