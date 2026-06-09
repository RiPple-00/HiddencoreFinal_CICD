#!/usr/bin/env bash
# Rocky Linux — GitHub Actions self-hosted runner 1회 설치
# GitHub: Repository → Settings → Actions → Runners → New self-hosted runner → 토큰 복사
#
# WEB 서버 (1.201.122.115):
#   bash setup-github-runner.sh ddasum-web <TOKEN>
# APP 서버 (121.78.123.214):
#   bash setup-github-runner.sh ddasum-app <TOKEN>
# AI 서버 (1.201.122.62):
#   bash setup-github-runner.sh ddasum-ai <TOKEN>
set -euo pipefail

LABEL="${1:?usage: setup-github-runner.sh <label> <registration-token>}"
TOKEN="${2:?registration token required}"
REPO_URL="https://github.com/RiPple-00/HiddencoreFinal"
RUNNER_USER="${SUDO_USER:-$(whoami)}"
RUNNER_HOME="$(eval echo "~${RUNNER_USER}")"
RUNNER_DIR="${RUNNER_HOME}/actions-runner"
RUNNER_NAME="ddasum-${LABEL#ddasum-}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "sudo 로 실행하세요: sudo bash $0 $LABEL <TOKEN>" >&2
  exit 1
fi

RUNNER_VERSION="$(
  curl -fsSL https://api.github.com/repos/actions/runner/releases/latest \
    | grep -oP '"tag_name": "\Kv[0-9.]+' \
    | head -1
)"
ARCH="x64"
PKG="actions-runner-linux-${ARCH}-${RUNNER_VERSION#v}.tar.gz"

dnf install -y curl tar libicu 2>/dev/null || yum install -y curl tar libicu

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [[ ! -f ./config.sh ]]; then
  curl -fsSL -o "$PKG" \
    "https://github.com/actions/runner/releases/download/${RUNNER_VERSION}/${PKG}"
  tar xzf "$PKG"
  chown -R "${RUNNER_USER}:${RUNNER_USER}" "$RUNNER_DIR"
fi

sudo -u "$RUNNER_USER" ./config.sh \
  --url "$REPO_URL" \
  --token "$TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "self-hosted,linux,${LABEL}" \
  --unattended \
  --replace

./svc.sh install "$RUNNER_USER"
./svc.sh start
./svc.sh status

echo ""
echo "등록 완료: label=${LABEL} name=${RUNNER_NAME}"
echo "GitHub → Settings → Actions → Runners 에서 Online 확인 후 push/deploy 하세요."
