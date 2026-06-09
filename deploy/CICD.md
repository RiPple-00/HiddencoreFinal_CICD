# Docker + GitHub Actions 동적 배포

`master` 브랜치 push 시 변경된 서버만 자동 배포합니다. (수동 `workflow_dispatch` 가능)

## SSH 타임아웃 (Connection timed out) 원인

GitHub **클라우드 러너**(`ubuntu-latest`)는 Microsoft Azure 등 해외 IP에서 실행됩니다.  
서버 방화벽/보안그룹이 **특정 IP만 SSH(22) 허용**하면 Actions → 서버 SSH가 `Connection timed out`으로 실패합니다.

**해결:** 각 서버에 **self-hosted runner**를 설치합니다. 러너가 서버 안에서 직접 배포하므로 인바운드 SSH가 필요 없습니다.

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

## 2) Self-hosted runner 등록 (서버당 1회, 필수)

GitHub → **Settings → Actions → Runners → New self-hosted runner** → Linux → 토큰 복사.

각 서버에 SSH 접속 후:

```bash
cd ~/ddasum-repo/deploy/scripts
# 최초 1회: 저장소 tarball 동기화 (runner 설치 전에도 가능)
curl -fsSL https://codeload.github.com/RiPple-00/HiddencoreFinal/tar.gz/master -o /tmp/repo.tgz
tar -xzf /tmp/repo.tgz -C /tmp && cp -a /tmp/HiddencoreFinal-*/deploy/scripts/setup-github-runner.sh .

# WEB (1.201.122.115)
sudo bash setup-github-runner.sh ddasum-web <REGISTRATION_TOKEN>

# APP (121.78.123.214)
sudo bash setup-github-runner.sh ddasum-app <REGISTRATION_TOKEN>

# AI (1.201.122.62)
sudo bash setup-github-runner.sh ddasum-ai <REGISTRATION_TOKEN>
```

Runners 화면에서 3대 모두 **Online** 이어야 push 배포가 동작합니다.

| 서버 | Runner 라벨 |
|------|-------------|
| WEB | `ddasum-web` |
| APP | `ddasum-app` |
| AI | `ddasum-ai` |

## 3) GitHub Secrets 등록

Repository → Settings → Secrets and variables → Actions:

| Secret | 예시 |
|--------|------|
| `DEPLOY_SSH_KEY` | (선택) 수동 SSH용 — **워크플로는 self-hosted runner 사용, SSH 불필요** |
| `DEPLOY_USER` | (선택) 수동 SSH용 `rocky` |
| `WEB_HOST` / `APP_HOST` / `AI_HOST` | (선택) 수동 SSH용 |
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
  → GitHub Actions (self-hosted runner, 해당 서버에서 실행)
  → sync-repo-from-github.sh → ~/ddasum-repo/
  → write-env.sh (.env 생성, chmod 600)
  → docker compose build && up -d
  → (APP만) reset-cloud-demo-and-restart.sh
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
