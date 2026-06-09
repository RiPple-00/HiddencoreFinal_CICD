# 보안 체크리스트

## Git에 절대 올리지 않음 (`.gitignore`)

- `**/application-local.yml`, `**/application-cloud.yml`
- `**/.env`, `deploy/.secrets.env`
- `*.pem`, `*.key`
- `deploy/**/.env` (서버용, CI가 생성)

커밋 전: `git status` 에 위 파일이 없어야 함.

## 비밀 저장 위치 (권장)

| 비밀 | 저장 |
|------|------|
| DB 비밀번호, JWT | GitHub Actions Secrets → 서버 `deploy/*/.env` (chmod 600) |
| OpenAI | GitHub Secret `OPENAI_API_KEY` → AI 서버 `.env` 만 |
| SSH 배포 키 | GitHub Secret `DEPLOY_SSH_KEY` 만 (repo·서버 홈에 커밋 금지) |

## 서버 파일 권한

```bash
chmod 700 ~/ddasum-repo/deploy/ddasum-app
chmod 600 ~/ddasum-repo/deploy/ddasum-app/.env
chmod 600 ~/ddasum-repo/deploy/ddasum-ai/.env
```

`~/application-cloud.yml` 은 **삭제 권장** — Docker는 `.env` 만 사용.

## GitHub Secrets 등록

Repository → Settings → Secrets and variables → Actions

`deploy/CICD.md` 표 참고.

## 유출 시 조치

1. OpenAI 키 즉시 폐기·재발급
2. MySQL 비밀번호 변경
3. `JWT_SECRET` 변경 → 전 사용자 재로그인
4. SSH 키 교체
