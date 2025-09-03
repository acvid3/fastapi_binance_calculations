#!/usr/bin/env bash
set -euo pipefail

# Always run from the directory of this script
cd "$(dirname "$0")"

# 1) Clear terminal logs
clear

echo "[1/4] Terminal cleared"

# 2) Stop and remove existing containers (keep volumes by default)
echo "[2/4] Stopping and removing containers..."
docker-compose down --remove-orphans

# 3) Build fresh images
echo "[3/4] Building images..."
docker-compose build --no-cache

# 4) Start containers and follow logs in real time
echo "[4/4] Starting containers..."
docker-compose up -d
echo "Following logs (press Ctrl+C to exit)"
docker-compose logs -f api


