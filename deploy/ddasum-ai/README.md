# AI 서버 배포 (`ddasum-ai-20260608`)

## 서비스

| 서비스 | 포트 | OpenAI | 일일 한도(코드) |
|--------|------|--------|----------------|
| chatbot | 8001 | ✅ gpt-4o-mini + embedding | 50회 |
| ai-report | 8002 | ✅ gpt-4o-mini | 15회 |
| ai-server | 8000 | ❌ 로컬 YOLO | — |

## 비용 한도 (~월 3만원)

### 1) OpenAI 대시보드 (필수)

[OpenAI Billing → Limits](https://platform.openai.com/settings/organization/limits)

- **Monthly budget: $20 USD** (약 2.7~3만원)
- 알림 이메일 80% 켜기
- 한도 도달 시 **자동 차단** 선택

### 2) 서버 코드 한도

`start-services.sh` 기본값:

- `CHATBOT_DAILY_MAX=50`
- `AI_REPORT_DAILY_MAX=15`

초과 시 HTTP **429** 반환.

### 3) 공공데이터 API (HIRA·식약처 등)

- **금전 과금 없음** (공공데이터포털 인증키)
- 포털 **일일 호출 한도**(보통 1,000건/일)만 준수
- APP `application-cloud.yml`의 `public-data.service-key`에 실제 키 설정

### 4) APP 번역 OpenAI (선택)

클라우드에서는 `app.translation.enabled: false` 권장 (챗봇·보고서 예산 보호).

## 배포

```bash
# 로컬 PC — ai 업로드 (chatbot/.env 포함, Git 제외)
# deploy/ddasum-ai/setup-rocky.sh, start-services.sh 도 ~/ddasum-ai/ 에

ssh rocky@1.201.122.62
cd ~/ddasum-ai
sed -i 's/\r$//' setup-rocky.sh start-services.sh
bash setup-rocky.sh
bash start-services.sh
```

## APP 서버 연동

`~/application-cloud.yml`:

```yaml
app:
  ai-report:
    enabled: true
    base-url: http://192.168.0.163:8002
  gallery:
    ai-server-base-url: http://192.168.0.163:8000
  translation:
    enabled: false
```

## 보안그룹

- `8001` → WEB `192.168.0.37` (또는 app.ddasum.shop Nginx 경유)
- `8000`, `8002` → APP `192.168.0.181` 만

## WEB Nginx (이미 설정됨)

`frontend-app/nginx.conf` → `/chatbot/` → `192.168.0.163:8001`
