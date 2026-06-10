#!/usr/bin/env bash
# APP 배포 후 얼굴 인식 DB·환자 이미지 복원 (gitignore 대상)
set -euo pipefail

REPO="${HOME}/ddasum-repo"
FACE_ROOT="$REPO/ai/dasum-face-ai-test"
REP_FILE="$FACE_ROOT/data/face_db/representatives/patient_representatives.npy"
BAK="${HOME}/ddasum-repo.bak/ai/dasum-face-ai-test"

if [[ -f "$REP_FILE" ]]; then
  echo "[ensure-face-ai] representatives OK"
  exit 0
fi

if [[ -d "$BAK/data/face_db" ]]; then
  echo "[ensure-face-ai] restoring face_db from backup..."
  mkdir -p "$FACE_ROOT/data"
  cp -a "$BAK/data/face_db" "$FACE_ROOT/data/"
fi

if [[ -d "$BAK/data/patients" && ! -d "$FACE_ROOT/data/patients" ]]; then
  cp -a "$BAK/data/patients" "$FACE_ROOT/data/"
fi

if [[ -d "$BAK/data/patients_preprocessed" && ! -d "$FACE_ROOT/data/patients_preprocessed" ]]; then
  cp -a "$BAK/data/patients_preprocessed" "$FACE_ROOT/data/"
fi

if [[ -f "$REP_FILE" ]]; then
  echo "[ensure-face-ai] restored from backup"
  exit 0
fi

DOCKER="docker"
if ! docker info >/dev/null 2>&1; then DOCKER="sudo docker"; fi

if $DOCKER ps --format '{{.Names}}' | grep -q '^ddasum-backend$'; then
  echo "[ensure-face-ai] building patient DB inside container (first run may take a few minutes)..."
  $DOCKER exec ddasum-backend python3 /ai/dasum-face-ai-test/scripts/build_patient_db.py \
    || echo "[ensure-face-ai] build skipped — check /ai mount and patient images" >&2
fi

if [[ -f "$REP_FILE" ]]; then
  echo "[ensure-face-ai] build OK"
else
  echo "[ensure-face-ai] WARN: patient_representatives.npy still missing" >&2
fi
