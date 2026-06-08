-- 2026-05 요양사 체크리스트(CARE_CHECK) 1개월 더미 생성 스크립트
-- MySQL 8 기준
--
-- 사용 방법:
-- 2) 동일 환자/기간 기존 CARE_CHECK 데이터는 삭제 후 재생성합니다.

SET @target_start := DATE('2026-05-01');
SET @target_end := DATE('2026-05-31');

SET @target_patient_id := COALESCE(
    (SELECT p.patient_id FROM PATIENT p WHERE p.name = '데모' LIMIT 1),
    (SELECT p.patient_id FROM PATIENT p ORDER BY p.patient_id ASC LIMIT 1)
);

SET @target_patient_name := (
    SELECT p.name
    FROM PATIENT p
    WHERE p.patient_id = @target_patient_id
);

SET @target_facility_id := (
    SELECT p.facility_id
    FROM PATIENT p
    WHERE p.patient_id = @target_patient_id
);

-- 대상 환자가 없으면 에러 발생시켜 중단
SET @guard := IF(@target_patient_id IS NULL, (SELECT 1 / 0), 1);

START TRANSACTION;

DELETE FROM DOCUMENT
WHERE patient_id = @target_patient_id
  AND document_type = 'CARE_CHECK'
  AND record_date BETWEEN @target_start AND @target_end;

INSERT INTO DOCUMENT (
    patient_id,
    facility_id,
    document_type,
    title,
    content,
    document_status,
    overall_status,
    record_date,
    requested_at,
    created_at,
    updated_at
)
WITH RECURSIVE dates AS (
    SELECT @target_start AS dt
    UNION ALL
    SELECT DATE_ADD(dt, INTERVAL 1 DAY)
    FROM dates
    WHERE dt < @target_end
),
flags AS (
    SELECT
        dt,
        DAY(dt) AS day_num,
        (DAY(dt) IN (12, 27)) AS fall_alert,
        (MOD(DAY(dt), 7) = 0 OR DAY(dt) = 18) AS low_hydration,
        (MOD(DAY(dt), 9) = 0) AS appetite_low,
        (MOD(DAY(dt), 10) = 0) AS pain_abnormal,
        (DAY(dt) = 21) AS breathing_abnormal,
        (MOD(DAY(dt), 3) = 0) AS has_defecation_log
    FROM dates
)
SELECT
    @target_patient_id,
    @target_facility_id,
    'CARE_CHECK',
    CONCAT(@target_patient_name, ' 일일 업무 체크 - ', DATE_FORMAT(f.dt, '%Y-%m-%d')),
    CAST(
        JSON_OBJECT(
            'meal', JSON_OBJECT(
                'morning', JSON_OBJECT(
                    'intake', JSON_OBJECT('status', IF(f.appetite_low, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.appetite_low, '아침 식사량 평소 대비 감소', '')),
                    'hydration', JSON_OBJECT('status', IF(f.low_hydration, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.low_hydration, '수분 섭취량이 적음', '')),
                    'incident', JSON_OBJECT('status', 'NORMAL', 'memo', '')
                ),
                'lunch', JSON_OBJECT(
                    'intake', JSON_OBJECT('status', IF(f.appetite_low, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.appetite_low, '점심 식욕 저하', '')),
                    'hydration', JSON_OBJECT('status', IF(f.low_hydration, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.low_hydration, '점심 물 섭취 부족', '')),
                    'incident', JSON_OBJECT('status', IF(f.fall_alert, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.fall_alert, '식사 중 어지럼 호소', ''))
                ),
                'dinner', JSON_OBJECT(
                    'intake', JSON_OBJECT('status', 'NORMAL', 'memo', ''),
                    'hydration', JSON_OBJECT('status', IF(f.low_hydration, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.low_hydration, '저녁 수분 섭취 권고', '')),
                    'incident', JSON_OBJECT('status', 'NORMAL', 'memo', '')
                )
            ),
            'hygiene', JSON_OBJECT(
                'bedding', JSON_OBJECT('status', 'NORMAL', 'memo', ''),
                'patientItems', JSON_OBJECT('status', IF(f.fall_alert, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.fall_alert, '보행보조기 재정비 필요', '')),
                'bathing', JSON_OBJECT('status', 'NORMAL', 'memo', '')
            ),
            'condition', JSON_OBJECT(
                'breathing', JSON_OBJECT('status', IF(f.breathing_abnormal, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.breathing_abnormal, '호흡 빠름 관찰', '')),
                'pain', JSON_OBJECT('status', IF(f.pain_abnormal, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.pain_abnormal, '허리 통증 호소', '')),
                'fall', JSON_OBJECT('status', IF(f.fall_alert, 'ABNORMAL', 'NORMAL'), 'memo', IF(f.fall_alert, '이동 중 중심 잃음', ''))
            ),
            'elimination', JSON_OBJECT(
                'urination', JSON_OBJECT(
                    'count', 2,
                    'logs', JSON_ARRAY(
                        JSON_OBJECT(
                            'id', CONCAT('u-', f.day_num, '-1'),
                            'status', 'NORMAL',
                            'memo', '오전 배뇨',
                            'createdAt', CONCAT(DATE_FORMAT(f.dt, '%Y-%m-%d'), 'T09:00:00')
                        ),
                        JSON_OBJECT(
                            'id', CONCAT('u-', f.day_num, '-2'),
                            'status', IF(f.low_hydration, 'ABNORMAL', 'NORMAL'),
                            'memo', IF(f.low_hydration, '소변량 감소', '오후 배뇨'),
                            'createdAt', CONCAT(DATE_FORMAT(f.dt, '%Y-%m-%d'), 'T16:00:00')
                        )
                    )
                ),
                'defecation', JSON_OBJECT(
                    'count', IF(f.has_defecation_log, 1, 0),
                    'logs', IF(
                        f.has_defecation_log,
                        JSON_ARRAY(
                            JSON_OBJECT(
                                'id', CONCAT('d-', f.day_num, '-1'),
                                'status', 'NORMAL',
                                'memo', '배변 확인',
                                'createdAt', CONCAT(DATE_FORMAT(f.dt, '%Y-%m-%d'), 'T10:30:00')
                            )
                        ),
                        JSON_ARRAY()
                    )
                )
            ),
            'specialNotes', COALESCE(
                CONCAT_WS('. ',
                    IF(f.low_hydration, '수분 섭취량이 평소보다 적어 수시 권고함', NULL),
                    IF(f.appetite_low, '식사량 감소 관찰되어 간식 보충', NULL),
                    IF(f.pain_abnormal, '통증 호소로 체위 변경 및 휴식 유도', NULL),
                    IF(f.breathing_abnormal, '호흡 패턴 변화 관찰, 추가 모니터링 필요', NULL),
                    IF(f.fall_alert, '이동 시 낙상 위험 있어 보행 보조 강화', NULL)
                ),
                '특이사항 없음'
            )
        ) AS CHAR
    ),
    'PENDING_APPROVAL',
    IF(
        f.fall_alert OR f.breathing_abnormal OR f.pain_abnormal OR f.low_hydration OR f.appetite_low,
        'ABNORMAL',
        'NORMAL'
    ),
    f.dt,
    TIMESTAMP(f.dt, '18:00:00'),
    TIMESTAMP(f.dt, '18:00:00'),
    TIMESTAMP(f.dt, '18:00:00')
FROM flags f;

COMMIT;

SELECT
    @target_patient_id AS patient_id,
    @target_patient_name AS patient_name,
    COUNT(*) AS inserted_rows,
    MIN(record_date) AS min_record_date,
    MAX(record_date) AS max_record_date
FROM DOCUMENT
WHERE patient_id = @target_patient_id
  AND document_type = 'CARE_CHECK'
  AND record_date BETWEEN @target_start AND @target_end;
