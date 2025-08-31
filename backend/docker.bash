#!/bin/bash

echo "[LOG] Rebuilding and starting containers..."
clear
sudo docker compose down
sudo docker compose build
sudo docker compose up -d

echo "[LOG] Streaming logs..."
sudo docker compose logs -f
