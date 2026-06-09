#!/usr/bin/env bash
set -euo pipefail
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "Docker already installed: $(docker --version)"
  exit 0
fi
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo 2>/dev/null || true
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin rsync
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER" || true
echo "Docker installed. Re-login may be required for group docker."
