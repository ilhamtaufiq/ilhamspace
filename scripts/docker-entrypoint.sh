#!/bin/sh
set -e

# Production always uses the Docker volume path — never ./data inside the image.
if [ "${NODE_ENV:-}" = "production" ]; then
  export DATABASE_PATH=/app/data/ilhamspace.db
elif [ -z "${DATABASE_PATH:-}" ]; then
  export DATABASE_PATH=/app/data/ilhamspace.db
fi

db_path="$DATABASE_PATH"
data_dir="$(dirname "$db_path")"
mkdir -p "$data_dir"

history_file="${data_dir}/.deploy-history"
deploy_num=1
if [ -f "$history_file" ]; then
  deploy_num="$(($(wc -l < "$history_file" | tr -d ' ') + 1))"
fi
echo "$(date -Iseconds) deploy #${deploy_num}" >> "$history_file"
echo "[entrypoint] Deploy #${deploy_num} (history: ${history_file})"

mount_root=""
if [ -r /proc/self/mountinfo ]; then
  mount_root="$(awk -v mp="${data_dir}" '$5 == mp { print $4; exit }' /proc/self/mountinfo)"
fi

if [ -n "${mount_root}" ]; then
  volume_name=""
  case "${mount_root}" in
    *docker/volumes/*/_data)
      volume_name="$(echo "${mount_root}" | sed 's|.*/docker/volumes/\([^/]*\)/_data|\1|')"
      ;;
  esac

  case "${mount_root}" in
    *docker/volumes*)
      echo "[entrypoint] Docker volume (${volume_name:-unknown}): ${mount_root} -> ${data_dir}"
      if [ -n "${volume_name}" ] && [ "${volume_name}" != "ilhamspace-data" ]; then
        case "${volume_name}" in
          ????????????????????????????????????????????????????????????????)
            echo "[entrypoint] WARNING: Ephemeral Coolify hash volume detected (${volume_name})."
            echo "[entrypoint] Coolify UI -> Persistent Storage -> DELETE all /app/data entries."
            echo "[entrypoint] Compose must use named volume ilhamspace-data only."
            ;;
        esac
      fi
      ;;
    /)
      echo "[entrypoint] FATAL: ${data_dir} is mounted from disk root."
      exit 1
      ;;
    *)
      echo "[entrypoint] Data bind: ${mount_root} -> ${data_dir}"
      ;;
  esac
else
  echo "[entrypoint] FATAL: ${data_dir} is not mounted."
  echo "[entrypoint] docker-compose.yml must mount ilhamspace-data:/app/data"
  if [ "${NODE_ENV:-}" = "production" ]; then
    exit 1
  fi
fi

if [ -f "$db_path" ]; then
  db_bytes="$(wc -c < "$db_path" | tr -d ' ')"
  echo "[entrypoint] Database: ${db_path} (${db_bytes} bytes)"
  db_exists=1
else
  echo "[entrypoint] First boot — no database at ${db_path} yet."
  db_exists=0
fi

run_migrate=0
case "${RUN_MIGRATIONS:-auto}" in
  0|false|no|skip)
    echo "[entrypoint] Skipping migrations (RUN_MIGRATIONS=${RUN_MIGRATIONS})"
    ;;
  1|true|yes|force)
    echo "[entrypoint] Running migrations (RUN_MIGRATIONS=force)..."
    run_migrate=1
    ;;
  *)
    if node --import tsx scripts/check-migrations.ts; then
      echo "[entrypoint] Schema up to date — database not modified."
    else
      pending_rc=$?
      if [ "$pending_rc" -eq 2 ]; then
        echo "[entrypoint] Pending migrations detected — applying..."
        run_migrate=1
      else
        echo "[entrypoint] Migration check failed (exit ${pending_rc}) — applying migrations..."
        run_migrate=1
      fi
    fi
    ;;
esac

if [ "$run_migrate" -eq 1 ]; then
  pnpm exec drizzle-kit migrate
fi

run_admin=0
case "${ENSURE_ADMIN:-auto}" in
  0|false|no|skip)
    echo "[entrypoint] Skipping admin provisioning (ENSURE_ADMIN=${ENSURE_ADMIN})"
    ;;
  1|true|yes|force)
    run_admin=1
    export ENSURE_ADMIN_MODE=force
    ;;
  *)
    if [ "$db_exists" -eq 0 ]; then
      run_admin=1
      export ENSURE_ADMIN_MODE=create-only
    elif node --import tsx scripts/has-admin.ts 2>/dev/null; then
      echo "[entrypoint] Admin exists — database not modified (ENSURE_ADMIN=1 to reset password)."
    else
      run_admin=1
      export ENSURE_ADMIN_MODE=create-only
    fi
    ;;
esac

if [ "$run_admin" -eq 1 ]; then
  if [ -n "${ADMIN_EMAIL:-}" ] && { [ -n "${ADMIN_PASSWORD_HASH:-}" ] || [ -n "${ADMIN_PASSWORD:-}" ]; }; then
    echo "[entrypoint] Ensuring admin user (mode: ${ENSURE_ADMIN_MODE:-create-only})..."
    if ! node --import tsx scripts/ensure-admin.ts; then
      echo "[entrypoint] ERROR: admin provisioning failed — login will not work."
      echo "[entrypoint] Use ADMIN_EMAIL + ADMIN_PASSWORD, or a fully quoted ADMIN_PASSWORD_HASH."
    fi
  else
    echo "[entrypoint] Skipping admin — set ADMIN_EMAIL and ADMIN_PASSWORD on first deploy."
  fi
fi

echo "[entrypoint] Starting server on ${HOST:-0.0.0.0}:${PORT:-3000}..."
exec node --import tsx server.ts