#!/usr/bin/env bash
# 클라우드 데모 DB 초기화 후 Spring Boot 재시작 → Java Seeder가 로컬과 동일 더미 생성
set -euo pipefail

REPO="${HOME}/ddasum-repo"
SQL="${REPO}/deploy/scripts/reset-cloud-demo.sql"
DOCKER="docker"
if ! docker info >/dev/null 2>&1; then DOCKER="sudo docker"; fi

: "${MYSQL_URL:?MYSQL_URL required}"
: "${MYSQL_USERNAME:?MYSQL_USERNAME required}"
: "${MYSQL_PASSWORD:?MYSQL_PASSWORD required}"

if [[ ! -f "$SQL" ]]; then
  echo "reset SQL not found: $SQL" >&2
  exit 1
fi

MYSQL_HOST=""
MYSQL_PORT="3306"
MYSQL_DB="ddasum"
if [[ "$MYSQL_URL" =~ jdbc:mysql://([^:/]+):?([0-9]*)/([^?]+) ]]; then
  MYSQL_HOST="${BASH_REMATCH[1]}"
  if [[ -n "${BASH_REMATCH[2]}" ]]; then
    MYSQL_PORT="${BASH_REMATCH[2]}"
  fi
  MYSQL_DB="${BASH_REMATCH[3]}"
else
  echo "Cannot parse MYSQL_URL: $MYSQL_URL" >&2
  exit 1
fi

echo "[reset-cloud-demo] ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}"

$DOCKER run --rm -i \
  -e MYSQL_PWD="${MYSQL_PASSWORD}" \
  mysql:8.4 \
  mysql \
    -h "${MYSQL_HOST}" \
    -P "${MYSQL_PORT}" \
    -u "${MYSQL_USERNAME}" \
    --default-character-set=utf8mb4 \
    "${MYSQL_DB}" < "$SQL"

echo "[reset-cloud-demo] restarting ddasum-backend (stop/start may take ~60s)..."
$DOCKER restart ddasum-backend
echo "[reset-cloud-demo] container restarted — seeders run on Spring Boot startup"

# CI SSH 세션은 장시간 대기 시 Broken pipe(255)로 끊김 → 기본은 즉시 종료
if [[ "${WAIT_FOR_SEED:-0}" == "1" ]]; then
  LOG="${HOME}/reset-cloud-demo-wait.log"
  : >"$LOG"
  nohup bash -c "
    set -euo pipefail
    DOCKER='${DOCKER}'
    for i in \$(seq 1 60); do
      if \$DOCKER logs ddasum-backend 2>&1 | grep -q 'Started DdasumBackendApplication'; then
        echo \"[reset-cloud-demo] backend ready (\$((i * 5))s)\" | tee -a '$LOG'
        exit 0
      fi
      echo \"[reset-cloud-demo] waiting startup... \$i/60\" >> '$LOG'
      sleep 5
    done
    echo '[reset-cloud-demo] timeout — check: docker logs ddasum-backend' >> '$LOG'
    \$DOCKER logs ddasum-backend --tail 40 2>&1 >> '$LOG' || true
  " >>"$LOG" 2>&1 &
  echo "[reset-cloud-demo] startup wait running in background: ${LOG}"
fi
