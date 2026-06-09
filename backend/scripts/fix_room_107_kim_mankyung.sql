-- A동 107호 4인실 정리: 기만경 1번 침상만 배정, 장원준 등 잘못 배정 제거
-- 실행: mysql -u root -p --default-character-set=utf8mb4 ddasum < backend/scripts/fix_room_107_kim_mankyung.sql

SET NAMES utf8mb4;

SET @kim_id := 260401008;
SET @jang_id := 260401007;
SET @building := 'A동';
SET @floor := 1;
SET @room := '107';

-- 107호 중복 침상 1번 행: location_id 가장 작은 1건만 유지
UPDATE LOCATION dup
INNER JOIN (
  SELECT MIN(location_id) AS keep_id, bed
  FROM LOCATION
  WHERE building = @building AND floor = @floor AND room = @room
  GROUP BY bed
) k ON dup.bed = k.bed AND dup.location_id <> k.keep_id
SET dup.patient_id = NULL, dup.is_occupied = 0
WHERE dup.building = @building AND dup.floor = @floor AND dup.room = @room;

-- 107호 2~4번 침상 비우기
UPDATE LOCATION
SET patient_id = NULL, is_occupied = 0
WHERE building = @building AND floor = @floor AND room = @room AND bed IN (2, 3, 4);

-- 107호에 잘못 들어간 환자(기만경 제외) location 해제
UPDATE PATIENT p
INNER JOIN LOCATION l ON p.location_id = l.location_id
SET p.location_id = NULL
WHERE l.building = @building AND l.floor = @floor AND l.room = @room
  AND p.patient_id <> @kim_id;

UPDATE LOCATION
SET patient_id = NULL, is_occupied = 0
WHERE building = @building AND floor = @floor AND room = @room
  AND patient_id IS NOT NULL AND patient_id <> @kim_id;

-- 기만경 → 107호 1번 침상
SET @bed1_id := (
  SELECT MIN(location_id) FROM LOCATION
  WHERE building = @building AND floor = @floor AND room = @room AND bed = 1
);

UPDATE LOCATION SET patient_id = NULL, is_occupied = 0
WHERE building = @building AND floor = @floor AND room = @room;

UPDATE LOCATION
SET patient_id = @kim_id, is_occupied = 1, room_capacity = 4
WHERE location_id = @bed1_id;

UPDATE PATIENT SET location_id = @bed1_id WHERE patient_id = @kim_id;

-- 장원준 → 105호 1번 (있을 때)
SET @bed105_id := (
  SELECT MIN(location_id) FROM LOCATION
  WHERE building = @building AND floor = @floor AND room = '105' AND bed = 1
);

UPDATE PATIENT SET location_id = NULL WHERE patient_id = @jang_id;

UPDATE LOCATION SET patient_id = NULL, is_occupied = 0 WHERE location_id = @bed105_id;

UPDATE LOCATION SET patient_id = @jang_id, is_occupied = 1 WHERE location_id = @bed105_id;

UPDATE PATIENT SET location_id = @bed105_id WHERE patient_id = @jang_id;

SELECT l.location_id, l.bed, l.is_occupied, p.patient_id, p.name
FROM LOCATION l
LEFT JOIN PATIENT p ON l.patient_id = p.patient_id
WHERE l.building = @building AND l.floor = @floor AND l.room = @room
ORDER BY l.bed;
