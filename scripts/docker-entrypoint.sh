#!/bin/sh
set -e

db_path="${DATABASE_PATH:-/data/ilhamspace.db}"
data_dir="$(dirname "$db_path")"
mkdir -p "$data_dir"

if grep -qE "[[:space:]]${data_dir}[[:space:]]" /proc/mounts 2>/dev/null; then
  mount_src="$(grep -E "[[:space:]]${data_dir}[[:space:]]" /proc/mounts | awk '{print $1}' | head -n1)"
  echo "[entrypoint] Data volume: ${mount_src} -> ${data_dir}"
else
  echo "[entrypoint] ERROR: ${data_dir} is not a persistent volume."
  echo "[entrypoint] Coolify -> Persistent Storage -> add mount path /data (named volume)."
  echo "[entrypoint] Dockerfile VOLUME alone is NOT enough — redeploy creates a new empty volume."
fi

if [ -f "$db_path" ]; then
  db_bytes="$(wc -c < "$db_path" | tr -d ' ')"
  echo "[entrypoint] Database: $db_path (${db_bytes} bytes)"
else
  echo "[entrypoint] WARNING: No database at $db_path — creating a new empty file."
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