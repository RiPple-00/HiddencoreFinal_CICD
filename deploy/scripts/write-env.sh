#!/usr/bin/env bash
# CI에서 서버에 .env 생성 (값은 GitHub Secrets → 환경 변수로 전달)
set -euo pipefail
TARGET="${1:?usage: write-env.sh /path/to/deploy-dir}"
mkdir -p "$TARGET"
chmod 700 "$TARGET"
cat > "$TARGET/.env" <<EOF
MYSQL_URL=${MYSQL_URL:-jdbc:mysql://192.168.0.48:3306/ddasum?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true}
MYSQL_USERNAME=${MYSQL_USERNAME:-ddasum}
MYSQL_PASSWORD=${MYSQL_PASSWORD:?MYSQL_PASSWORD required}
JWT_SECRET=${JWT_SECRET:?JWT_SECRET required}
AI_REPORT_URL=${AI_REPORT_URL:-http://192.168.0.163:8002}
AI_SERVER_URL=${AI_SERVER_URL:-http://192.168.0.163:8000}
PUBLIC_DATA_SERVICE_KEY=${PUBLIC_DATA_SERVICE_KEY:-}
UPLOAD_HOST_DIR=${UPLOAD_HOST_DIR:-/data/ddasum/uploads}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
CHATBOT_DAILY_MAX=${CHATBOT_DAILY_MAX:-50}
AI_REPORT_DAILY_MAX=${AI_REPORT_DAILY_MAX:-15}
EOF
chmod 600 "$TARGET/.env"
echo "wrote $TARGET/.env"
