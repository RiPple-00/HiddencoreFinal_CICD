-- 기만경(260401008) 한글 깨짐 복구 — UTF-8 클라이언트로 실행 (mysql --default-character-set=utf8mb4)
SET NAMES utf8mb4;

UPDATE `PATIENT`
SET
  `name` = '기만경',
  `address` = '서울특별시 종로구',
  `admission_status` = '알츠하이머형 치매, 경도 단계
Mild Alzheimer''s Dementia',
  `memo` = '최근 기억력 저하가 주된 양상으로 관찰되며, 특히 최근 대화 내용이나 식사 여부, 약 복용 여부에 대한 회상이 불안정합니다. 과거 기억과 기본적인 의사소통 능력은 비교적 유지되고 있으나, 시간 지남력 저하와 반복 질문이 동반됩니다. 현재 상태에서는 일상생활 전반의 독립성은 일부 유지되나, 복약 관리 및 일정 확인에는 보호자 또는 요양 인력의 보조가 필요합니다.',
  `updated_at` = NOW()
WHERE `patient_id` = 260401008;

UPDATE `LOCATION`
SET `building` = 'A동'
WHERE `patient_id` = 260401008;
