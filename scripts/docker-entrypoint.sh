#!/bin/sh
set -e

export DATABASE_PATH="/app/persist/ilhamspace.db"
db_dir="/app/persist"
mkdir -p "$db_dir"

mount_root="$(awk -v mp="$db_dir" '$5 == mp { print $4; exit }' /proc/self/mountinfo 2>/dev/null || true)"
if echo "$mount_root" | grep -q '/docker/volumes/'; then
  vol_name="$(echo "$mount_root" | sed 's|.*/docker/volumes/\([^/]*\)/_data|\1|')"
  echo "[entrypoint] Persistent volume: $vol_name"
else
  echo "[entrypoint] WARN: /app/persist tidak ter-mount — aktifkan Docker Compose di Coolify"
fi

deploy_ts="$(date -Iseconds 2>/dev/null || date)"
echo "$deploy_ts" >> "$db_dir/.deploy-history"
deploy_n="$(wc -l < "$db_dir/.deploy-history" | tr -d ' ')"
echo "[entrypoint] Deploy #$deploy_n"

db_exists=0
if [ -f "$DATABASE_PATH" ] && [ -s "$DATABASE_PATH" ]; then
  db_exists=1
  echo "[entrypoint] Database ready ($(wc -c < "$DATABASE_PATH" | tr -d ' ') bytes)"
else
  echo "[entrypoint] First boot — creating database"
  if [ -f /app/seed/ilhamspace.db ] && [ -s /app/seed/ilhamspace.db ]; then
    cp /app/seed/ilhamspace.db "$DATABASE_PATH"
    db_exists=1
    echo "[entrypoint] Seeded schema ($(wc -c < "$DATABASE_PATH" | tr -d ' ') bytes)"
  fi
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