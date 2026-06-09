# Docker + GitHub Actions 동적 배포

`main` 브랜치 push 시 변경된 서버만 자동 배포합니다. (수동 `workflow_dispatch` 가능)

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

## 2) GitHub Secrets 등록

Repository → Settings → Secrets and variables → Actions:

| Secret | 예시 |
|--------|------|
| `DEPLOY_SSH_KEY` | `ddasum-key.pem` **전체 내용** |
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

## 3) 배포 흐름

```
git push main
  → GitHub Actions
  → rsync ~/ddasum-repo/ (서버)
  → write-env.sh (.env 생성, chmod 600)
  → docker compose build && up -d
```

## 4) 수동 1회 전환 (지금 서버)

기존 `java -jar` / `nohup python` 중지 후:

```bash
# APP 예시
pkill -f ddasum-backend.jar || true
cd ~/ddasum-repo/deploy/ddasum-app
# .env 는 CI가 만들거나 write-env.sh 로 생성
docker compose build && docker compose up -d
```

## 5) 보안

- `.env` / `application-cloud.yml` → **gitignore**
- 서버 `.env` → `chmod 600`, 소유자 `rocky`만
- JWT·DB·OpenAI → **환경 변수 / GitHub Secrets** (yml 평문 제거)
- SSH 키는 배포 전용 — GitHub Secrets에만 저장

자세한 비용 한도: `deploy/ddasum-ai/COST_LIMITS.md`
