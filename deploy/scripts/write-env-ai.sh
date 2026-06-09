#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:?usage: write-env-ai.sh /path/to/deploy/ddasum-ai}"
mkdir -p "$TARGET"
chmod 700 "$TARGET"
cat > "$TARGET/.env" <<EOF
OPENAI_API_KEY=${OPENAI_API_KEY:?OPENAI_API_KEY required}
OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
CHATBOT_DAILY_MAX=${CHATBOT_DAILY_MAX:-50}
AI_REPORT_DAILY_MAX=${AI_REPORT_DAILY_MAX:-15}
EOF
chmod 600 "$TARGET/.env"
echo "wrote $TARGET/.env"
