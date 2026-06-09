# API 비용 한도 가이드 (월 ~3만원 목표)

## OpenAI (~2.7만원 = $20/월)

1. [OpenAI Limits](https://platform.openai.com/settings/organization/limits) 접속
2. **Monthly budget: $20**
3. 80% 도달 시 이메일 알림 ON
4. 한도 초과 시 **차단** 선택

### 서버 코드 한도 (이미 적용)

| 서비스 | 환경변수 | 기본값 |
|--------|----------|--------|
| 챗봇 | `CHATBOT_DAILY_MAX` | 50회/일 |
| 보고서 AI | `AI_REPORT_DAILY_MAX` | 15회/일 |

`~/ddasum-ai/start-services.sh` 에서 변경 가능.

### ⚠️ 유효한 API 키 필요

AI 서버 `~/ddasum-ai/chatbot/.env`:

```
OPENAI_API_KEY=sk-...유효한키...
```

키 수정 후:

```bash
pkill -f chatbot.py
cd ~/ddasum-ai && bash start-services.sh
```

## 공공데이터 API (금전 과금 없음)

- HIRA·식약처 등: **무료** (data.go.kr 인증키)
- 포털 **일일 호출 한도** 준수 (통상 1,000건/일)
- APP `application-cloud.yml` → `public-data.service-key` 에 실제 키 설정

## 클라우드 인프라 (가비아)

- VM 4대 월 고정비 — OpenAI와 별도

## 번역 API (비용 절감)

APP `application-cloud.yml` 에 `translation.enabled: false` 적용됨.  
직원 웹 다국어 번역이 필요하면 키·한도 확인 후 `true` 로 변경.
