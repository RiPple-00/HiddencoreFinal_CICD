# WEB 서버 — 보호자 앱(Expo Web) Docker 배포 (`app.ddasum.shop`)

## 구조

```
[브라우저] → [호스트 Nginx app.ddasum.shop :80] → [Docker ddasum-frontend-app :8081]
           → [컨테이너 Nginx] → /api, /uploads → APP 192.168.0.181:8080
                              → /chatbot       → AI  192.168.0.163:8001
```

| 포트 | 용도 |
|------|------|
| `127.0.0.1:8080` | 직원 웹 (`ddasum.shop`) |
| `127.0.0.1:8081` | 보호자 앱 웹 (`app.ddasum.shop`) |

## DNS

가비아 DNS에 A 레코드 추가:

- `app` → `1.201.122.115` (WEB 서버 공인 IP)

## 1) 로컬 PC — frontend-app 업로드

`node_modules` 제외 후 업로드 (robocopy 또는 scp).

```powershell
# 예: 임시 폴더로 복사 후 scp
robocopy d:\final_ddasum\HiddencoreFinal\frontend-app C:\temp\ddasum-frontend-app /E /XD node_modules dist .expo .git
scp -i "C:\Users\1\.ssh\ddasum-key.pem" -r C:\temp\ddasum-frontend-app rocky@1.201.122.115:~/ddasum-frontend-app
```

`deploy/ddasum-web/nginx-host-app.conf` 도 함께 올리기:

```powershell
scp -i "C:\Users\1\.ssh\ddasum-key.pem" d:\final_ddasum\HiddencoreFinal\deploy\ddasum-web\nginx-host-app.conf rocky@1.201.122.115:~/
```

## 2) WEB 서버 — Docker 빌드·실행

```bash
cd ~/ddasum-frontend-app
docker compose build
docker compose up -d
docker ps
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8081/
```

## 3) 호스트 Nginx — app.ddasum.shop

```bash
sudo cp ~/nginx-host-app.conf /etc/nginx/conf.d/ddasum-app.conf
sudo nginx -t
sudo systemctl reload nginx
```

브라우저: `http://app.ddasum.shop`

## 4) 재배포

```bash
cd ~/ddasum-frontend-app
# scp 로 다시 업로드 후
docker compose build --no-cache
docker compose up -d
```

## 5) HTTPS

```bash
sudo certbot --nginx -d app.ddasum.shop
# 또는 기존 인증서에 도메인 추가
sudo certbot --nginx -d ddasum.shop -d www.ddasum.shop -d app.ddasum.shop
```

## IP 변경 시

`frontend-app/nginx.conf` 의 `192.168.0.181`(APP), `192.168.0.163`(AI) 수정 후 `docker compose build` 재실행.

## 빌드 환경 변수

Dockerfile / `docker-compose.yml` 에서 주입:

- `EXPO_PUBLIC_API_BASE_URL=/api`
- `EXPO_PUBLIC_CHATBOT_URL=/chatbot`

로컬 빌드 테스트:

```powershell
cd d:\final_ddasum\HiddencoreFinal\frontend-app
$env:EXPO_PUBLIC_API_BASE_URL="/api"
$env:EXPO_PUBLIC_CHATBOT_URL="/chatbot"
npm run build:web
```
