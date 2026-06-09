# WEB 서버 — Docker 기반 React 배포

## 구조

```
[브라우저] → [호스트 Nginx :80/443] → [Docker ddasum-frontend :8080] → [APP :8080 /api]
```

- `frontend/Dockerfile` : Node 빌드 + Nginx 이미지
- `frontend/nginx.conf` : 컨테이너 안 SPA + `/api` 프록시
- `deploy/ddasum-web/nginx-host.conf` : 호스트 Nginx → Docker 프록시

## 1) 로컬에서 이미지 빌드·전송 (방법 A — 서버에서 빌드)

프로젝트를 서버에 올린 뒤 서버에서 `docker compose build`.

## 2) 서버에서 직접 빌드 (권장)

### 로컬 PC — frontend 폴더 업로드

```powershell
scp -i "C:\Users\1\.ssh\ddasum-key.pem" -r d:\final_ddasum\HiddencoreFinal\frontend rocky@1.201.122.115:~/ddasum-frontend
```

### WEB 서버 SSH

```bash
cd ~/ddasum-frontend
docker compose build
docker compose up -d
docker ps
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/
```

### 호스트 Nginx를 Docker 앞단으로 변경

```bash
sudo cp ~/ddasum-frontend/../deploy/ddasum-web/nginx-host.conf /etc/nginx/conf.d/ddasum.conf
# deploy 폴더를 안 올렸다면 아래 deploy/ddasum-web/nginx-host.conf 내용을 직접 붙여넣기

sudo nginx -t
sudo systemctl reload nginx
```

`deploy` 경로 없이 올렸다면 `nginx-host.conf` 내용을 수동으로 `/etc/nginx/conf.d/ddasum.conf` 에 반영.

## 3) 재배포 (코드 수정 후)

```bash
cd ~/ddasum-frontend
git pull   # 또는 scp 로 다시 업로드
docker compose build --no-cache
docker compose up -d
```

## 4) HTTPS (도메인 연결 후)

호스트 Nginx에서 certbot (기존과 동일):

```bash
sudo certbot --nginx -d ddasum.shop -d www.ddasum.shop
```

## 5) GitHub Actions (나중에)

- `ssh-keygen` 배포 키 → 서버 `authorized_keys`
- workflow: `npm ci && docker compose build` on server via SSH
- 또는 CI에서 `docker build` + `docker save` + scp

## APP IP 변경 시

`frontend/nginx.conf` 의 `192.168.0.181` 수정 후 `docker compose build` 재실행.

## 보호자 앱 웹 (`app.ddasum.shop`)

동일 WEB 서버, Docker 포트 `8081`. 자세한 절차는 [README-app.md](./README-app.md) 참고.
