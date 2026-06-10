#!/usr/bin/env bash
# GitHub Actions / 서버에서 master(또는 지정 브랜치) tarball 동기화
set -euo pipefail
BRANCH="${1:-master}"
REPO="${HOME}/ddasum-repo"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "https://codeload.github.com/RiPple-00/HiddencoreFinal/tar.gz/${BRANCH}" -o "$TMP/repo.tgz"
tar -xzf "$TMP/repo.tgz" -C "$TMP"
ARCHIVE_DIR="$(ls -1 "$TMP" | head -1)"

# .bak 이 남아 있으면 mv 실패 → 기존 repo 위에 cp 병합 → File exists 오류
rm -rf "${REPO}.bak"
if [[ -d "$REPO" ]]; then
  mv "$REPO" "${REPO}.bak"
fi
cp -a "$TMP/${ARCHIVE_DIR}" "$REPO"
echo "synced ${BRANCH} -> ${REPO}"
