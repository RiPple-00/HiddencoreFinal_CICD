#!/usr/bin/env bash
# 시드 SQL 일괄 import (서버에서 backend/scripts 를 ~/ddasum-seeds 로 복사한 뒤 실행)
#   chmod +x import-seeds.sh && ./import-seeds.sh

set -euo pipefail

SEED_DIR="${1:-$HOME/ddasum-seeds}"
DB_NAME="${DDASUM_DB_NAME:-ddasum}"
DB_USER="${DDASUM_DB_USER:-ddasum}"

if [[ ! -d "${SEED_DIR}" ]]; then
  echo "시드 폴더 없음: ${SEED_DIR}" >&2
  exit 1
fi

read -rsp "MySQL ${DB_USER} 비밀번호: " DB_PASSWORD
echo

for f in seed_demo_ai_patients.sql seed_program_board_dummy.sql; do
  path="${SEED_DIR}/${f}"
  if [[ -f "${path}" ]]; then
    echo "==> ${f}"
    MYSQL_PWD="${DB_PASSWORD}" mysql -u "${DB_USER}" "${DB_NAME}" < "${path}"
  else
    echo "건너뜀 (없음): ${f}"
  fi
done

echo "시드 import 완료."
