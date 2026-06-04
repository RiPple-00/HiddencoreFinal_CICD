-- 요양사 「기만경」 ↔ 107호 환자 연결 (코드/도메인 변경 없이 DB만 수정)
--
-- 실행 전 확인:
--   SELECT user_id, name, role FROM USERS WHERE name = '기만경';
--   SELECT p.patient_id, p.name, l.room, l.bed, u.name AS caregiver
--     FROM PATIENT p
--     JOIN LOCATION l ON p.location_id = l.location_id
--     LEFT JOIN USERS u ON p.primary_caregiver_user_id = u.user_id
--     WHERE REPLACE(l.room, '호', '') IN ('107', '402');

SET @caregiver_id := (
  SELECT user_id
  FROM USERS
  WHERE name = '기만경'
    AND role = 'CAREGIVER'
  LIMIT 1
);

SELECT @caregiver_id AS caregiver_user_id;

-- ---------------------------------------------------------------------------
-- 1) 402호 + 기만경 담당 환자 → 빈 107호 병상으로 이동 (병상 1:1 매칭)
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_move_plan;
CREATE TEMPORARY TABLE tmp_move_plan (
  patient_id BIGINT NOT NULL,
  old_location_id BIGINT NOT NULL,
  new_location_id BIGINT NOT NULL,
  PRIMARY KEY (patient_id)
);

INSERT INTO tmp_move_plan (patient_id, old_location_id, new_location_id)
WITH to_move AS (
  SELECT p.patient_id,
         p.location_id AS old_location_id,
         ROW_NUMBER() OVER (ORDER BY p.patient_id) AS rn
  FROM PATIENT p
  INNER JOIN LOCATION l ON p.location_id = l.location_id
  WHERE p.primary_caregiver_user_id = @caregiver_id
    AND @caregiver_id IS NOT NULL
    AND REPLACE(l.room, '호', '') = '402'
),
free_107 AS (
  SELECT l.location_id,
         ROW_NUMBER() OVER (ORDER BY l.bed) AS rn
  FROM LOCATION l
  WHERE REPLACE(l.room, '호', '') = '107'
    AND (l.patient_id IS NULL OR l.is_occupied = 0)
)
SELECT t.patient_id, t.old_location_id, f.location_id
FROM to_move t
INNER JOIN free_107 f ON t.rn = f.rn;

UPDATE LOCATION loc
INNER JOIN tmp_move_plan m ON loc.location_id = m.old_location_id
SET loc.patient_id = NULL,
    loc.is_occupied = 0;

UPDATE LOCATION loc
INNER JOIN tmp_move_plan m ON loc.location_id = m.new_location_id
SET loc.patient_id = m.patient_id,
    loc.is_occupied = 1;

UPDATE PATIENT p
INNER JOIN tmp_move_plan m ON p.patient_id = m.patient_id
SET p.location_id = m.new_location_id;

-- 402호에 남은 기만경 담당 해제 (이동하지 못한 환자 포함)
UPDATE PATIENT p
INNER JOIN LOCATION l ON p.location_id = l.location_id
SET p.primary_caregiver_user_id = NULL
WHERE p.primary_caregiver_user_id = @caregiver_id
  AND @caregiver_id IS NOT NULL
  AND REPLACE(l.room, '호', '') = '402';

-- ---------------------------------------------------------------------------
-- 2) 107호 입원 환자 전원 → 담당 요양사 기만경
-- ---------------------------------------------------------------------------
UPDATE PATIENT p
INNER JOIN LOCATION l ON p.location_id = l.location_id
SET p.primary_caregiver_user_id = @caregiver_id
WHERE @caregiver_id IS NOT NULL
  AND REPLACE(l.room, '호', '') = '107'
  AND p.discharge_date IS NULL;

-- ---------------------------------------------------------------------------
-- 결과 확인
-- ---------------------------------------------------------------------------
SELECT p.patient_id, p.name, l.building, l.floor, l.room, l.bed, u.name AS primary_caregiver
FROM PATIENT p
INNER JOIN LOCATION l ON p.location_id = l.location_id
LEFT JOIN USERS u ON p.primary_caregiver_user_id = u.user_id
WHERE REPLACE(l.room, '호', '') = '107'
ORDER BY l.bed;

SELECT COUNT(*) AS remaining_402_with_kim
FROM PATIENT p
INNER JOIN LOCATION l ON p.location_id = l.location_id
WHERE p.primary_caregiver_user_id = @caregiver_id
  AND REPLACE(l.room, '호', '') = '402';
