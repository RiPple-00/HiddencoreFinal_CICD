# 데모 DB 온보딩 가이드

팀원이 clone 후 **동일한 더미 데이터**로 개발하려면 아래 순서를 따르세요.

> **단일 진실(Single Source of Truth):** `bootRun` 시 실행되는 **Java Seeder**가 기준입니다.  
> SQL 파일은 보조(얼굴 AI 환자·수동 리셋)용입니다.

---

## 빠른 시작 (신규 팀원)

### 1. MySQL DB 생성

```sql
CREATE DATABASE IF NOT EXISTS ddasum
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 2. 백엔드 로컬 설정

```bash
cd backend
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml
# application-local.yml 에 MySQL 비밀번호 등 수정
```

### 3. 백엔드 기동 (더미 자동 생성)

```bash
cd backend
./gradlew bootRun
```

`bootRun` 한 번이면 아래 Java Seeder가 자동 실행됩니다.

| Seeder | 내용 |
|--------|------|
| `DataSeeder` | 시설 `12345678`, 원무·요양사·보호자 계정, 병동 LOCATION |
| `KimMankyungPatientSeeder` | 기만경 `260401008`, A동 107호, guardian001 연동 |
| `GuardianReportDemoSeeder` | 6/1~6/7 체크리스트 + 처방전 더미 |
| `ProgramRecruitmentSeeder` | 프로그램 게시판 모집 현황 |
| `ProgramApplicationSeeder` | 프로그램 신청 관리 더미 |
| `GuardianProgramDemoGuard` | guardian001 데모 프로그램 신청 제거 |

### 4. (선택) 얼굴 AI 시연 환자 6명

얼굴 인식·갤러리 시연에 필요할 때만 실행합니다. `bootRun`만으로도 기만경은 생성됩니다.

```bash
mysql -u root -p ddasum < scripts/seed_demo_ai_patients.sql
```

| AI 폴더 | 환자 | patient_id |
|---------|------|------------|
| patient_1 | 나채영 | 260401023 |
| patient_2 | 김영희 | 260401001 |
| patient_3 | 강나연 | 260402001 |
| patient_4 | 김태우 | 260401005 |
| patient_5 | 장원준 | 260401007 |
| patient_6 | **기만경** | **260401008** ← 보호자 시연 기본 |

### 5. (선택) 보호자 앱 `.env`

```bash
cd frontend-app
cp .env.example .env
# EXPO_PUBLIC_PATIENT_ID=260401008 확인 (기본값 이미 설정됨)
# EXPO_PUBLIC_REQUESTER_USER_ID 는 비워 두세요 (면회 예약 시 서버가 guardian001 자동 연결)
```

---

## 데모 계정

시설코드: **`12345678`** (데모 요양병원)

| 역할 | 로그인 | 비밀번호 |
|------|--------|----------|
| 원무과 | 시설코드 `12345678` + 직원ID `1120010101` | `office123!` |
| 요양사 | 시설코드 `12345678` + 직원ID `3120010101` | `office123!` |
| 보호자 | `guardian001` | `1234` |

보호자 연결 환자: **기만경** (`patient_id = 260401008`, A동 107호)

---

## DB가 꼬였을 때 (예전 더미·user_id 불일치)

Seeder는 **이미 데이터가 있으면 스킵**하는 경우가 있어, 예전 로컬 DB는 팀 기준과 달라질 수 있습니다.

### 방법 A — 전체 초기화 (가장 확실)

```sql
DROP DATABASE ddasum;
CREATE DATABASE ddasum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

이후 `./gradlew bootRun` (+ 필요 시 `seed_demo_ai_patients.sql`).

### 방법 B — `reset_demo.sql` (테이블 데이터만 비우기)

```bash
cd backend
mysql -u root -p ddasum < scripts/reset_demo.sql
./gradlew bootRun
```

Windows PowerShell:

```powershell
cd backend
Get-Content scripts\reset_demo.sql -Raw -Encoding UTF8 | mysql -u root -p ddasum
.\gradlew bootRun
```

---

## 한글 깨짐

기만경 이름·진단명이 깨지면:

```bash
cd backend
./gradlew fixKimEncoding
```

또는 `scripts/fix_kim_mankyung_utf8.sql` 수동 실행.

---

## SQL 스크립트 역할 정리

| 파일 | 필요 시점 |
|------|-----------|
| `reset_demo.sql` | 로컬 DB 데이터 전체 비우기 → `bootRun` 재시드 |
| `seed_demo_ai_patients.sql` | 얼굴 AI 6명 + 기만경·guardian001 연동 보강 |
| `seed_program_board_dummy.sql` | **보통 불필요** — `ProgramRecruitmentSeeder`가 대체 |
| `seed_care_checklist_*.sql` | **보통 불필요** — `GuardianReportDemoSeeder`가 6/1~6/7 생성 |
| `link_guardian001_kim_mankyung.sql` | 연결만 수동 복구할 때 |
| `link_caregiver_kim_mankyung_room_107.sql` | 요양사·107호 배정 수동 복구 |

---

## AI 서비스 (보고서·얼굴)

| 서비스 | 경로 | 포트 |
|--------|------|------|
| 주간 보고서 AI | `ai/ai-report` → `python report_service.py` | 8002 |
| 얼굴 AI | `ai/dasum-face-ai-test` | 8000 |

보고서는 **완료된 주**만 조회됩니다 (예: 2026-06-01 ~ 06-07).

---

## 동작 확인 체크리스트

- [ ] 원무 로그인 → 기만경 환자 상세·진단명 표시
- [ ] 보호자 `guardian001` 로그인 → 주간 보고서 6/1~6/7 조회
- [ ] 보호자 프로그램 추천 → 「신청하기」 활성 (데모 승인 건 없음)
- [ ] 보호자 면회 → 예약 신청 완료 화면 이동
- [ ] 요양사 → A동 107호 기만경 체크리스트

---

## Git에 올리지 말 것

- `application-local.yml` (비밀번호·API 키)
- `frontend-app/.env` (PC IP)
- MySQL dump 백업 파일 (`.sql` 덤프)

이 파일(`README_DEMO.md`)과 `reset_demo.sql`, `*Seeder.java`는 **커밋**하세요.
