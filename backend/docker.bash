#!/bin/bash

echo "[LOG] Rebuilding and starting containers..."
clear
docker compose down
docker compose build
docker compose up -d

echo "[LOG] Streaming logs..."
docker compose logs -f
