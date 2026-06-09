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

mv "$REPO" "${REPO}.bak" 2>/dev/null || true
mkdir -p "$REPO"
cp -a "$TMP/${ARCHIVE_DIR}/." "$REPO/"
echo "synced ${BRANCH} -> ${REPO}"
