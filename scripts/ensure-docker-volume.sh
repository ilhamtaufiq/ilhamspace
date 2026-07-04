#!/bin/sh
# Run once on the Coolify server (SSH) before deploying ilhamspace:
#   sh scripts/ensure-docker-volume.sh
set -e
if docker volume inspect ilhamspace-db >/dev/null 2>&1; then
  echo "Volume ilhamspace-db already exists."
else
  docker volume create ilhamspace-db
  echo "Created volume ilhamspace-db."
fi
docker volume inspect ilhamspace-db --format '{{.Name}} {{.Mountpoint}}'