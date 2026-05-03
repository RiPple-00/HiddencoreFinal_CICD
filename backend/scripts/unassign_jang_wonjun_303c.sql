-- 장원준을 303-C 침상에서 분리 (PATIENT·LOCATION 양쪽 FK 정합성 맞춤)
-- 아래 ID는 예시입니다. INSERT 하신 값(patient_id=203, location_id=103)과 다르면 수정 후 실행하세요.
--
-- 확인용:
-- SELECT patient_id, name, location_id FROM PATIENT WHERE name LIKE '%장원준%';
-- SELECT location_id, room, bed, patient_id FROM LOCATION WHERE room = '303' AND bed = 'C';

UPDATE LOCATION
SET patient_id = NULL,
    is_occupied = false
WHERE location_id = 103;

UPDATE PATIENT
SET location_id = NULL
WHERE patient_id = 203;
