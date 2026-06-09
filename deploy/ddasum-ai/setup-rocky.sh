#!/usr/bin/env bash
# AI 서버(Rocky 9) — Python venv + 의존성 설치
set -euo pipefail

AI_HOME="${AI_HOME:-$HOME/ddasum-ai}"
VENV="$AI_HOME/.venv"

echo "=== AI setup: $AI_HOME ==="
sudo dnf install -y python3 python3-pip python3-devel gcc gcc-c++ 2>/dev/null || true

mkdir -p "$AI_HOME/logs"

if [[ ! -d "$VENV" ]]; then
  python3 -m venv "$VENV"
fi
# shellcheck disable=SC1091
source "$VENV/bin/activate"
pip install --upgrade pip wheel

echo "=== chatbot ==="
pip install -r "$AI_HOME/chatbot/requirements.txt"
pip install pysqlite3-binary

echo "=== ai-report ==="
pip install -r "$AI_HOME/ai-report/requirements.txt"

echo "=== ai-server (YOLO — 시간 소요) ==="
pip install -r "$AI_HOME/ai-server/requirements.txt" || {
  echo "[경고] ai-server 일부 패키지 설치 실패 — 활동 분류는 모델 파일 필요 시 별도 확인"
}

echo "=== setup done ==="
python3 --version
pip list | grep -E 'fastapi|openai|uvicorn|ultralytics' || true
