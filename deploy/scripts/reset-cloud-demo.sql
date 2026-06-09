-- 클라우드 데모 DB 초기화 (Rocky Linux MySQL — 테이블명 소문자)
-- 실행 후 APP 서버에서 ddasum-backend 컨테이너 재시작 → Java Seeder 자동 실행
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE medication_detail;
TRUNCATE TABLE post_application;
TRUNCATE TABLE document;
TRUNCATE TABLE medication;
TRUNCATE TABLE guardian_patient;
TRUNCATE TABLE patient_assignment;
TRUNCATE TABLE patient_note;
TRUNCATE TABLE notification;
TRUNCATE TABLE emergency_call;
TRUNCATE TABLE meal_plan;
TRUNCATE TABLE schedule;
TRUNCATE TABLE post;
TRUNCATE TABLE patient;
TRUNCATE TABLE location;
TRUNCATE TABLE users;
TRUNCATE TABLE facility;

SET FOREIGN_KEY_CHECKS = 1;
SELECT 'reset-cloud-demo.sql 완료 — APP 서버에서 docker restart ddasum-backend' AS next_step;
