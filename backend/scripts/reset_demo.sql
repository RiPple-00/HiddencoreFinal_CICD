-- =============================================================================
-- 데모 DB 초기화 (로컬 개발용)
-- =============================================================================
-- 용도
--   예전 더미·잘못된 user_id·꼬인 연결 데이터를 비우고,
--   이후 ./gradlew bootRun 으로 Java Seeder가 동일한 데모 상태를 다시 채웁니다.
--
-- 주의
--   ddasum DB의 **모든 앱 데이터**가 삭제됩니다. (스키마/테이블은 유지)
--   운영 DB에서는 절대 실행하지 마세요.
--
-- 실행 (backend 디렉터리 기준)
--   mysql -u root -p ddasum < scripts/reset_demo.sql
--
-- 실행 후 필수
--   cd backend && ./gradlew bootRun
--   (얼굴 AI 시연 환자 6명이 필요하면) mysql ... < scripts/seed_demo_ai_patients.sql
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `MEDICATION_DETAIL`;
TRUNCATE TABLE `POST_APPLICATION`;
TRUNCATE TABLE `DOCUMENT`;
TRUNCATE TABLE `MEDICATION`;
TRUNCATE TABLE `GUARDIAN_PATIENT`;
TRUNCATE TABLE `PATIENT_ASSIGNMENT`;
TRUNCATE TABLE `PATIENT_NOTE`;
TRUNCATE TABLE `NOTIFICATION`;
TRUNCATE TABLE `EMERGENCY_CALL`;
TRUNCATE TABLE `MEAL_PLAN`;
TRUNCATE TABLE `SCHEDULE`;
TRUNCATE TABLE `POST`;
TRUNCATE TABLE `PATIENT`;
TRUNCATE TABLE `LOCATION`;
TRUNCATE TABLE `USERS`;
TRUNCATE TABLE `FACILITY`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'reset_demo.sql 완료 — 이제 ./gradlew bootRun 을 실행하세요.' AS next_step;
