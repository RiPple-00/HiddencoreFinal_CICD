# Docker + GitHub Actions 동적 배포

`master` 브랜치 push 시 변경된 서버만 자동 배포합니다. (수동 `workflow_dispatch` 가능)

## SSH 타임아웃 (Connection timed out) 원인

GitHub **클라우드 러너**(`ubuntu-latest`)는 Microsoft Azure 등 해외 IP에서 실행됩니다.  
서버 방화벽/보안그룹이 **특정 IP만 SSH(22) 허용**하면 Actions → 서버 SSH가 `Connection timed out`으로 실패합니다.

**해결:** 보안그룹에서 GitHub Actions IP 또는 `0.0.0.0/0`(22) 허용 후, 워크플로가 SSH로 서버에 접속해 배포합니다.

## 아키텍처

| 서버 | Workflow | Compose 경로 |
|------|----------|--------------|
| WEB `1.201.122.115` | `deploy-web.yml` | `deploy/ddasum-web/docker-compose.yml` |
| APP `121.78.123.214` | `deploy-app.yml` | `deploy/ddasum-app/docker-compose.yml` |
| AI `1.201.122.62` | `deploy-ai.yml` | `deploy/ddasum-ai/docker-compose.yml` |
| DB `1.201.122.29` | (수동/2단계) | `deploy/ddasum-db/docker-compose.yml` |

DB는 **이미 수동 설치된 MySQL**이 있으므로 Docker 이전은 데이터 백업 후 별도 진행.

## 1) 서버 사전 준비 (각 서버 1회)

```bash
# Rocky 9
sudo dnf install -y docker docker-compose-plugin rsync
sudo systemctl enable --now docker
sudo usermod -aG docker rocky
# 재로그인 후
docker compose version
mkdir -p ~/ddasum-repo
```

WEB 호스트 Nginx(`/etc/nginx/conf.d/`)는 기존과 동일 — Docker는 `127.0.0.1:8080/8081`만 노출.

## 2) GitHub Actions SSH 키 (서버 1회)

로컬 PC:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f gaboja_deploy_key
```

서버 `rocky` 계정 `~/.ssh/authorized_keys`에 `gaboja_deploy_key.pub` 내용 추가.

GitHub Secrets → `DEPLOY_SSH_KEY` = `gaboja_deploy_key` **전체 내용** (개행 포함).

## 3) GitHub Secrets 등록

Repository → Settings → Secrets and variables → Actions:

| Secret | 예시 |
|--------|------|
| `DEPLOY_SSH_KEY` | 배포 전용 SSH 개인키 전체 |
| `DEPLOY_USER` | `rocky` |
| `WEB_HOST` | `1.201.122.115` |
| `APP_HOST` | `121.78.123.214` |
| `AI_HOST` | `1.201.122.62` |
| `MYSQL_URL` | `jdbc:mysql://192.168.0.48:3306/ddasum?...` |
| `MYSQL_USERNAME` | `ddasum` |
| `MYSQL_PASSWORD` | (DB 비밀번호) |
| `JWT_SECRET` | 64자 이상 랜덤 |
| `OPENAI_API_KEY` | `sk-...` |
| `AI_REPORT_URL` | `http://192.168.0.163:8002` |
| `AI_SERVER_URL` | `http://192.168.0.163:8000` |
| `PUBLIC_DATA_SERVICE_KEY` | (선택) |

비밀값은 **GitHub Secrets에만** — 저장소 파일에는 없음.

## 4) 배포 흐름

```
git push master
  → GitHub Actions (ubuntu-latest → SSH)
  → sync-repo-from-github.sh → ~/ddasum-repo/
  → write-env.sh (.env 생성, chmod 600)
  → docker compose build && up -d
  → (APP push) DB 초기화 **하지 않음** — 데이터 유지
  → (APP 수동) `reset_demo_db: true` 선택 시에만 reset-cloud-demo-and-restart.sh
  → (전체 수동) Actions → **Deploy ALL (safe, no DB reset)** workflow_dispatch
```

## 5) 수동 1회 전환 (지금 서버)

기존 `java -jar` / `nohup python` 중지 후:

```bash
# APP 예시
pkill -f ddasum-backend.jar || true
cd ~/ddasum-repo/deploy/ddasum-app
# .env 는 CI가 만들거나 write-env.sh 로 생성
docker compose build && docker compose up -d
```

## 6) 보안

- `.env` / `application-cloud.yml` → **gitignore**
- 서버 `.env` → `chmod 600`, 소유자 `rocky`만
- JWT·DB·OpenAI → **환경 변수 / GitHub Secrets** (yml 평문 제거)
- SSH 키는 배포 전용 — GitHub Secrets에만 저장

자세한 비용 한도: `deploy/ddasum-ai/COST_LIMITS.md`
