-- =============================================================================
-- AI 얼굴 인식 시연용 환자 6명 + 기만경(보호자 갤러리) 시드 SQL
-- =============================================================================
-- 용도
--   - patient_1~6 (얼굴 AI) ↔ MySQL PATIENT 매핑
--   - 프로그램 사진 업로드 시 기만경(patient_6) → patient_id 260401008 필수
--   - 보호자 guardian001 ↔ 기만경 연결
--
-- 실행 (DB 이름·계정은 환경에 맞게 수정)
--   mysql -u root -p ddasum < backend/scripts/seed_demo_ai_patients.sql
--
-- AI 매핑
--   patient_1 나채영  → 260401023
--   patient_2 김영희  → 260401001
--   patient_3 강나연  → 260402001
--   patient_4 김태우  → 260401005
--   patient_5 장원준  → 260401007
--   patient_6 기만경  → 260401008  (보호자 사진 기록 대상)
-- =============================================================================

SET NAMES utf8mb4;
SET @now := NOW();

-- ---------------------------------------------------------------------------
-- 1) 데모 시설 (시설코드 12345678)
-- ---------------------------------------------------------------------------
INSERT INTO `FACILITY` (`facility_id`, `name`, `address`, `phone`, `facility_code`, `created_at`, `updated_at`)
SELECT 2, '데모 요양병원', '서울특별시', '02-0000-0000', '12345678', @now, @now
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `FACILITY` WHERE `facility_code` = '12345678');

UPDATE `FACILITY`
SET `name` = '데모 요양병원',
    `facility_code` = '12345678',
    `updated_at` = @now
WHERE `facility_id` = 2
  AND (`facility_code` IS NULL OR `facility_code` <> '12345678');

SELECT `facility_id` INTO @demo_facility_id
FROM `FACILITY`
WHERE `facility_code` = '12345678'
ORDER BY `facility_id`
LIMIT 1;

SELECT @demo_facility_id AS demo_facility_id;

-- ---------------------------------------------------------------------------
-- 2) 107호 병상 (기만경 배정용, 없으면 생성)
-- ---------------------------------------------------------------------------
SELECT `location_id` INTO @loc_107_bed1
FROM `LOCATION`
WHERE `facility_id` = @demo_facility_id
  AND `building` = 'A동'
  AND `floor` = 1
  AND `room` = '107'
  AND `bed` = 1
LIMIT 1;

INSERT INTO `LOCATION` (
  `facility_id`, `patient_id`, `building`, `floor`, `room`, `bed`,
  `room_type`, `roomgender_type`, `room_capacity`, `is_occupied`,
  `created_at`, `updated_at`
)
SELECT @demo_facility_id, NULL, 'A동', 1, '107', 1,
       'GENERAL', 'MALE', 4, 0, @now, @now
FROM DUAL
WHERE @loc_107_bed1 IS NULL;

SELECT `location_id` INTO @loc_107_bed1
FROM `LOCATION`
WHERE `facility_id` = @demo_facility_id
  AND `building` = 'A동'
  AND `floor` = 1
  AND `room` = '107'
  AND `bed` = 1
LIMIT 1;

-- ---------------------------------------------------------------------------
-- 3) AI 시연 환자 6명 (UPSERT)
-- ---------------------------------------------------------------------------
INSERT INTO `PATIENT` (
  `patient_id`, `facility_id`, `location_id`, `primary_caregiver_user_id`,
  `name`, `gender`, `birth_date`, `address`, `admission_date`, `discharge_date`,
  `blood_type`, `admission_status`, `status`, `memo`, `created_at`, `updated_at`
) VALUES
-- patient_1 나채영
(260401023, @demo_facility_id, NULL, NULL,
 '나채영', 'FEMALE', '1981-04-05', '서울', '2026-05-30', NULL,
 'O_POSITIVE', NULL, 'MONITORING', 'AI patient_1', @now, @now),
-- patient_2 김영희
(260401001, @demo_facility_id, NULL, NULL,
 '김영희', 'FEMALE', '1952-03-14', '서울', '2026-04-01', NULL,
 'A_POSITIVE', NULL, 'STABLE', 'AI patient_2', @now, @now),
-- patient_3 강나연
(260402001, @demo_facility_id, NULL, NULL,
 '강나연', 'FEMALE', '1991-11-02', '서울', '2026-06-04', NULL,
 'AB_NEGATIVE', NULL, 'STABLE', 'AI patient_3', @now, @now),
-- patient_4 김태우
(260401005, @demo_facility_id, NULL, NULL,
 '김태우', 'MALE', '1968-04-30', '서울', '2026-05-01', NULL,
 'A_POSITIVE', NULL, 'STABLE', 'AI patient_4', @now, @now),
-- patient_5 장원준
(260401007, @demo_facility_id, NULL, NULL,
 '장원준', 'MALE', '1965-10-20', '서울', '2026-05-02', NULL,
 'AB_POSITIVE', NULL, 'STABLE', 'AI patient_5', @now, @now),
-- patient_6 기만경 (보호자 갤러리·원무 시연 환자)
(260401008, @demo_facility_id, @loc_107_bed1, NULL,
 '기만경', 'MALE', '1942-05-12', '서울특별시 종로구', '2026-04-10', NULL,
 'A_POSITIVE',
 '알츠하이머형 치매, 경도 단계
Mild Alzheimer''s Dementia',
 'MONITORING',
 '최근 기억력 저하가 주된 양상으로 관찰되며, 특히 최근 대화 내용이나 식사 여부, 약 복용 여부에 대한 회상이 불안정합니다. 과거 기억과 기본적인 의사소통 능력은 비교적 유지되고 있으나, 시간 지남력 저하와 반복 질문이 동반됩니다. 현재 상태에서는 일상생활 전반의 독립성은 일부 유지되나, 복약 관리 및 일정 확인에는 보호자 또는 요양 인력의 보조가 필요합니다.',
 @now, @now)
ON DUPLICATE KEY UPDATE
  `facility_id` = VALUES(`facility_id`),
  `name` = VALUES(`name`),
  `gender` = VALUES(`gender`),
  `birth_date` = VALUES(`birth_date`),
  `admission_date` = VALUES(`admission_date`),
  `blood_type` = VALUES(`blood_type`),
  `status` = VALUES(`status`),
  `admission_status` = VALUES(`admission_status`),
  `memo` = VALUES(`memo`),
  `location_id` = IF(VALUES(`patient_id`) = 260401008, VALUES(`location_id`), `location_id`),
  `updated_at` = @now;

-- 기만경 ↔ 107호 병상 양방향 연결
UPDATE `LOCATION`
SET `patient_id` = 260401008,
    `is_occupied` = 1,
    `updated_at` = @now
WHERE `location_id` = @loc_107_bed1;

UPDATE `PATIENT`
SET `location_id` = @loc_107_bed1,
    `facility_id` = @demo_facility_id,
    `updated_at` = @now
WHERE `patient_id` = 260401008;

-- ---------------------------------------------------------------------------
-- 4) 요양사(3120010101) → 기만경 담당 (있을 때만)
-- ---------------------------------------------------------------------------
SET @caregiver_id := (
  SELECT `user_id`
  FROM `USERS`
  WHERE `employee_login_id` = '3120010101'
     OR `login_id` LIKE '%3120010101'
  ORDER BY `user_id`
  LIMIT 1
);

UPDATE `PATIENT`
SET `primary_caregiver_user_id` = @caregiver_id,
    `updated_at` = @now
WHERE `patient_id` = 260401008
  AND @caregiver_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 5) 보호자 guardian001 ↔ 기만경 (주 보호자)
-- ---------------------------------------------------------------------------
SET @guardian_id := (
  SELECT `user_id`
  FROM `USERS`
  WHERE `login_id` = 'guardian001'
  LIMIT 1
);

INSERT INTO `GUARDIAN_PATIENT` (`guardian_user_id`, `patient_id`, `relationship`, `is_primary`, `created_at`)
SELECT @guardian_id, 260401008, '가족', 1, @now
FROM DUAL
WHERE @guardian_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `GUARDIAN_PATIENT`
    WHERE `guardian_user_id` = @guardian_id
      AND `patient_id` = 260401008
  );

-- 기만경만 주 보호자 (DataSeeder 데모 환자 등 기존 primary 해제)
UPDATE `GUARDIAN_PATIENT`
SET `is_primary` = 0
WHERE `guardian_user_id` = @guardian_id
  AND `patient_id` <> 260401008
  AND @guardian_id IS NOT NULL;

UPDATE `GUARDIAN_PATIENT`
SET `is_primary` = 1,
    `relationship` = COALESCE(`relationship`, '가족')
WHERE `guardian_user_id` = @guardian_id
  AND `patient_id` = 260401008
  AND @guardian_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 6) 결과 확인
-- ---------------------------------------------------------------------------
SELECT
  p.patient_id,
  p.name,
  p.facility_id,
  f.facility_code,
  l.building,
  l.floor,
  l.room,
  l.bed,
  u.name AS primary_caregiver
FROM `PATIENT` p
LEFT JOIN `FACILITY` f ON p.facility_id = f.facility_id
LEFT JOIN `LOCATION` l ON p.location_id = l.location_id
LEFT JOIN `USERS` u ON p.primary_caregiver_user_id = u.user_id
WHERE p.patient_id IN (260401001, 260401005, 260401007, 260401008, 260401023, 260402001)
ORDER BY p.patient_id;

SELECT gp.guardian_user_id, u.login_id, gp.patient_id, p.name, gp.is_primary
FROM `GUARDIAN_PATIENT` gp
JOIN `USERS` u ON gp.guardian_user_id = u.user_id
JOIN `PATIENT` p ON gp.patient_id = p.patient_id
WHERE p.patient_id = 260401008;
