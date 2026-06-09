#!/usr/bin/env bash
# AI 3종 서비스 백그라운드 기동
set -euo pipefail

AI_HOME="${AI_HOME:-$HOME/ddasum-ai}"
VENV="$AI_HOME/.venv"
# shellcheck disable=SC1091
source "$VENV/bin/activate"

mkdir -p "$AI_HOME/logs"

stop_one() {
  local pattern="$1"
  pkill -f "$pattern" 2>/dev/null || true
}

stop_one "chatbot.py"
stop_one "report_service.py"
stop_one "uvicorn app.main:app"

# 월 ~3만원 예산: 챗봇 일 50회, 보고서 AI 일 15회 (프로세스별)
cd "$AI_HOME/chatbot"
export DAILY_MAX_REQUESTS="${CHATBOT_DAILY_MAX:-50}"
nohup python chatbot.py > "$AI_HOME/logs/chatbot.log" 2>&1 &
echo "chatbot pid=$! (daily max $DAILY_MAX_REQUESTS)"

cd "$AI_HOME/ai-report"
export DAILY_MAX_REQUESTS="${AI_REPORT_DAILY_MAX:-15}"
nohup python report_service.py > "$AI_HOME/logs/ai-report.log" 2>&1 &
echo "ai-report pid=$! (daily max $DAILY_MAX_REQUESTS)"

cd "$AI_HOME/ai-server"
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$AI_HOME/logs/ai-server.log" 2>&1 &
echo "ai-server pid=$!"

sleep 5
ss -tlnp | grep -E '8000|8001|8002' || true
curl -sf http://127.0.0.1:8001/health && echo " chatbot OK" || echo "chatbot FAIL"
curl -sf http://127.0.0.1:8002/health && echo " ai-report OK" || echo "ai-report FAIL"
curl -sf http://127.0.0.1:8000/docs -o /dev/null && echo "ai-server OK" || echo "ai-server WARN (모델 없으면 /ai/action 만 실패)"
