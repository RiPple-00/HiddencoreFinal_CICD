-- 2026-06-01 ~ 2026-06-07 기만경(260401008) 요양사 체크리스트 더미
-- 사용: MySQL에서 실행 (또는 bootRun 시 GuardianReportDemoSeeder 가 자동 생성)

SET @target_patient_id := 260401008;
SET @target_start := DATE('2026-06-01');
SET @target_end := DATE('2026-06-07');

SET @target_facility_id := (
  SELECT p.facility_id FROM PATIENT p WHERE p.patient_id = @target_patient_id
);

DELETE FROM DOCUMENT
WHERE patient_id = @target_patient_id
  AND document_type = 'CARE_CHECK'
  AND record_date BETWEEN @target_start AND @target_end;

-- GuardianReportDemoSeeder 와 동일 패턴의 7일치 데이터는
-- Spring bootRun 시 Java 시더가 자동 생성합니다.
-- 수동 SQL이 필요하면 seed_care_checklist_may_2026.sql 를 참고해 기간·환자 ID만 바꿔 실행하세요.

SELECT COUNT(*) AS care_check_count
FROM DOCUMENT
WHERE patient_id = @target_patient_id
  AND document_type = 'CARE_CHECK'
  AND record_date BETWEEN @target_start AND @target_end;
