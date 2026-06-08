-- guardian001 ↔ 기만경(260401008) 단일 주 보호자 연결
-- 사용: mysql -u root -p ddasum < backend/scripts/link_guardian001_kim_mankyung.sql

SET @now := NOW();
SET @guardian_id := (
  SELECT `user_id` FROM `USERS` WHERE `login_id` = 'guardian001' LIMIT 1
);
SET @patient_id := 260401008;

-- 기만경 없으면 seed_demo_ai_patients.sql 먼저 실행
INSERT INTO `GUARDIAN_PATIENT` (`guardian_user_id`, `patient_id`, `relationship`, `is_primary`, `created_at`)
SELECT @guardian_id, @patient_id, '가족', 1, @now
FROM DUAL
WHERE @guardian_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM `PATIENT` WHERE `patient_id` = @patient_id)
  AND NOT EXISTS (
    SELECT 1 FROM `GUARDIAN_PATIENT`
    WHERE `guardian_user_id` = @guardian_id AND `patient_id` = @patient_id
  );

-- 기만경 외 연결 제거
DELETE FROM `GUARDIAN_PATIENT`
WHERE `guardian_user_id` = @guardian_id
  AND `patient_id` <> @patient_id
  AND @guardian_id IS NOT NULL;

UPDATE `GUARDIAN_PATIENT`
SET `is_primary` = 1, `relationship` = COALESCE(`relationship`, '가족')
WHERE `guardian_user_id` = @guardian_id
  AND `patient_id` = @patient_id
  AND @guardian_id IS NOT NULL;

SELECT gp.guardian_user_id, u.login_id, gp.patient_id, p.name, gp.is_primary, gp.relationship
FROM `GUARDIAN_PATIENT` gp
JOIN `USERS` u ON gp.guardian_user_id = u.user_id
JOIN `PATIENT` p ON gp.patient_id = p.patient_id
WHERE u.login_id = 'guardian001';
