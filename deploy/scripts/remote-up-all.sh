#!/usr/bin/env bash
# 서버에서 실행: ~/ddasum-repo 동기화 후 Docker 기동
set -euo pipefail
ROLE="${1:?usage: remote-up-all.sh web|app|ai}"
REPO="${HOME}/ddasum-repo"
DOCKER="docker"
if ! docker info >/dev/null 2>&1; then DOCKER="sudo docker"; fi

compose_up() {
  local dir="$1"
  cd "$dir"
  $DOCKER compose down --remove-orphans 2>/dev/null || true
  $DOCKER compose build
  $DOCKER compose up -d
}

case "$ROLE" in
  web)
    $DOCKER rm -f ddasum-frontend ddasum-frontend-app 2>/dev/null || true
    compose_up "$REPO/deploy/ddasum-web"
    ;;
  app)
    pkill -f ddasum-backend.jar 2>/dev/null || true
    pkill -f 'java -jar' 2>/dev/null || true
    rm -f "${HOME}/application-cloud.yml" 2>/dev/null || true
    if [[ -f "${HOME}/ddasum-deploy.env" ]]; then
      set -a
      # shellcheck disable=SC1091
      source "${HOME}/ddasum-deploy.env"
      set +a
    fi
    bash "$REPO/deploy/scripts/write-env.sh" "$REPO/deploy/ddasum-app"
    # face_db·환자 이미지는 gitignore — 이전 배포 백업에서 복원
    if [[ -d "${HOME}/ddasum-repo.bak/ai/dasum-face-ai-test/data" ]]; then
      mkdir -p "$REPO/ai/dasum-face-ai-test/data"
      if [[ ! -f "$REPO/ai/dasum-face-ai-test/data/face_db/representatives/patient_representatives.npy" ]]; then
        cp -a "${HOME}/ddasum-repo.bak/ai/dasum-face-ai-test/data/." \
          "$REPO/ai/dasum-face-ai-test/data/" 2>/dev/null || true
      fi
    fi
    $DOCKER rm -f ddasum-backend 2>/dev/null || true
    compose_up "$REPO/deploy/ddasum-app"
    bash "$REPO/deploy/scripts/ensure-face-ai-data.sh" || true
    ;;
  ai)
    pkill -f chatbot.py 2>/dev/null || true
    pkill -f report_service.py 2>/dev/null || true
    pkill -f 'uvicorn app.main' 2>/dev/null || true
    # YOLO weights (*.pt) are gitignored — keep from previous deploy if sync omitted them
    if [[ ! -f "$REPO/ai/ai-server/models/action_model.pt" && -d "${HOME}/ddasum-repo.bak/ai/ai-server/models" ]]; then
      mkdir -p "$REPO/ai/ai-server/models"
      cp -a "${HOME}/ddasum-repo.bak/ai/ai-server/models/." "$REPO/ai/ai-server/models/"
    fi
    if [[ -f "${HOME}/ddasum-deploy.env" ]]; then
      set -a
      # shellcheck disable=SC1091
      source "${HOME}/ddasum-deploy.env"
      set +a
    fi
    bash "$REPO/deploy/scripts/write-env-ai.sh" "$REPO/deploy/ddasum-ai"
    $DOCKER rm -f ddasum-chatbot ddasum-ai-report ddasum-ai-server 2>/dev/null || true
    compose_up "$REPO/deploy/ddasum-ai"
    ;;
esac
$DOCKER ps
