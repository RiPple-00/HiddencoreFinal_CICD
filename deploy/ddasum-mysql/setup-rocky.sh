#!/usr/bin/env bash
# ddasum-mysql (Rocky Linux 9.x) 초기 설정
# 사용법 (서버에 SSH 접속 후):
#   chmod +x setup-rocky.sh && sudo ./setup-rocky.sh
#
# 환경 변수 (선택, 없으면 실행 중 입력):
#   DDASUM_DB_NAME=ddasum
#   DDASUM_DB_USER=ddasum
#   DDASUM_DB_PASSWORD=강한비밀번호

set -euo pipefail

DB_NAME="${DDASUM_DB_NAME:-ddasum}"
DB_USER="${DDASUM_DB_USER:-ddasum}"
DB_PASSWORD="${DDASUM_DB_PASSWORD:-}"

if [[ -z "${DB_PASSWORD}" ]]; then
  read -rsp "MySQL 사용자(${DB_USER}) 비밀번호 입력: " DB_PASSWORD
  echo
  read -rsp "비밀번호 확인: " DB_PASSWORD_CONFIRM
  echo
  if [[ "${DB_PASSWORD}" != "${DB_PASSWORD_CONFIRM}" ]]; then
    echo "비밀번호가 일치하지 않습니다." >&2
    exit 1
  fi
fi

echo "==> 패키지 업데이트 및 MySQL 설치"
sudo dnf -y update
sudo dnf -y install mysql-server

echo "==> MySQL 서비스 시작"
sudo systemctl enable mysqld
sudo systemctl start mysqld

echo "==> DB·계정 생성"
sudo mysql --protocol=socket -uroot <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL

echo "==> 원격 접속 허용 (bind-address)"
CFG="/etc/my.cnf.d/mysql-server.cnf"
if [[ -f "${CFG}" ]]; then
  if grep -q '^bind-address' "${CFG}"; then
    sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' "${CFG}"
  else
    echo "bind-address = 0.0.0.0" | sudo tee -a "${CFG}" >/dev/null
  fi
else
  echo "[mysqld]" | sudo tee /etc/my.cnf.d/ddasum-bind.cnf >/dev/null
  echo "bind-address = 0.0.0.0" | sudo tee -a /etc/my.cnf.d/ddasum-bind.cnf >/dev/null
fi
sudo systemctl restart mysqld

echo "==> 활동 사진 저장 디렉터리"
sudo mkdir -p /data/ddasum/uploads/gallery
RUN_USER="${SUDO_USER:-rocky}"
sudo chown -R "${RUN_USER}:${RUN_USER}" /data/ddasum
sudo chmod -R 755 /data/ddasum

echo ""
echo "완료."
echo "  DB 이름  : ${DB_NAME}"
echo "  DB 사용자: ${DB_USER}"
echo "  사진 경로: /data/ddasum/uploads/gallery"
echo "  JDBC URL : jdbc:mysql://192.168.0.48:3306/${DB_NAME}?serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
echo ""
echo "다음: 시드 SQL import (PC에서 scp 후 mysql -u ${DB_USER} -p ${DB_NAME} < seed.sql)"
