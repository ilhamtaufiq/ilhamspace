#!/bin/sh
set -e

export DATABASE_PATH="/app/persist/ilhamspace.db"
mkdir -p /app/persist

mount_root="$(awk -v mp="/app/persist" '$5 == mp { print $4; exit }' /proc/self/mountinfo 2>/dev/null || true)"
if [ -n "$mount_root" ] && [ "$mount_root" != "/" ]; then
  echo "[entrypoint] Storage mounted: $mount_root"
else
  echo "[entrypoint] WARN: ./data tidak ter-mount — set Build Pack ke Docker Compose"
fi

deploy_ts="$(date -Iseconds 2>/dev/null || date)"
echo "$deploy_ts" >> /app/persist/.deploy-history
deploy_n="$(wc -l < /app/persist/.deploy-history | tr -d ' ')"
echo "[entrypoint] Deploy #$deploy_n"

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