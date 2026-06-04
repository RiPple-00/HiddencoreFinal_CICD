-- 프로그램 게시판(APPLY/REVIEW) 모집 현황 더미 데이터
-- 원무과 게시판 > 프로그램 목록의 「모집 현황」(current_enrolled / capacity) 채우기
--
-- 실행:
--   mysql -u root -p ddasum < backend/scripts/seed_program_board_dummy.sql
--
-- 안전: 기존 APPLY 글은 모집 정보 보강, 부족하면 신규 INSERT

SET @now := NOW();

SELECT facility_id INTO @facility_id FROM FACILITY ORDER BY facility_id LIMIT 1;

SELECT user_id INTO @author_id
FROM USERS
WHERE role IN ('OFFICE', 'ADMIN')
ORDER BY user_id
LIMIT 1;

SELECT IFNULL(@facility_id, 0) AS facility_id, IFNULL(@author_id, 0) AS author_id;

-- ---------------------------------------------------------------------------
-- 1) 기존 참여 신청(APPLY) 글 모집 정보 보강
-- ---------------------------------------------------------------------------
UPDATE `POST`
SET
  `capacity` = 20,
  `current_enrolled` = 14,
  `start_at` = DATE_SUB(@now, INTERVAL 5 DAY),
  `end_at` = DATE_ADD(@now, INTERVAL 20 DAY),
  `post_status` = 'ACTIVE',
  `target_roles` = 'OFFICE,CAREGIVER',
  `updated_at` = @now
WHERE `post_type` = 'APPLY'
  AND (`facility_id` = @facility_id OR @facility_id IS NULL)
  AND (`title` LIKE '%종이접기%' OR `title` LIKE '%종이%');

UPDATE `POST`
SET
  `capacity` = 15,
  `current_enrolled` = 9,
  `start_at` = DATE_SUB(@now, INTERVAL 3 DAY),
  `end_at` = DATE_ADD(@now, INTERVAL 18 DAY),
  `post_status` = 'ACTIVE',
  `target_roles` = 'OFFICE,CAREGIVER',
  `updated_at` = @now
WHERE `post_type` = 'APPLY'
  AND (`facility_id` = @facility_id OR @facility_id IS NULL)
  AND (`title` LIKE '%원예%' OR `title` LIKE '%원예 치료%');

-- 나머지 APPLY(정원·일정 없는 글) 일괄 보강
UPDATE `POST`
SET
  `capacity` = COALESCE(`capacity`, 25),
  `current_enrolled` = CASE
    WHEN `current_enrolled` IS NULL OR `current_enrolled` = 0 THEN 11
    ELSE LEAST(`current_enrolled`, COALESCE(`capacity`, 25) - 1)
  END,
  `start_at` = COALESCE(`start_at`, DATE_SUB(@now, INTERVAL 2 DAY)),
  `end_at` = COALESCE(`end_at`, DATE_ADD(@now, INTERVAL 25 DAY)),
  `post_status` = 'ACTIVE',
  `updated_at` = @now
WHERE `post_type` = 'APPLY'
  AND (`facility_id` = @facility_id OR @facility_id IS NULL)
  AND (`capacity` IS NULL OR `start_at` IS NULL OR `end_at` IS NULL OR `current_enrolled` IS NULL OR `current_enrolled` = 0);

-- ---------------------------------------------------------------------------
-- 2) 신규 프로그램 글 (없을 때만 추가)
-- ---------------------------------------------------------------------------
INSERT INTO `POST` (
  `facility_id`, `author_user_id`, `post_type`, `is_pinned`, `title`, `content`,
  `target_roles`, `views`, `post_status`, `start_at`, `end_at`,
  `capacity`, `current_enrolled`, `created_at`, `updated_at`
)
SELECT @facility_id, @author_id, 'APPLY', 0,
  '6월 음악 치료 프로그램',
  '어르신 인지·정서 안정을 위한 음악 치료 프로그램입니다. 정원 18명.',
  'OFFICE,CAREGIVER', 24, 'ACTIVE',
  DATE_SUB(@now, INTERVAL 7 DAY), DATE_ADD(@now, INTERVAL 14 DAY),
  18, 12, @now, @now
FROM DUAL
WHERE @facility_id IS NOT NULL AND @author_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `POST` WHERE `title` = '6월 음악 치료 프로그램' AND `post_type` = 'APPLY'
  );

INSERT INTO `POST` (
  `facility_id`, `author_user_id`, `post_type`, `is_pinned`, `title`, `content`,
  `target_roles`, `views`, `post_status`, `start_at`, `end_at`,
  `capacity`, `current_enrolled`, `created_at`, `updated_at`
)
SELECT @facility_id, @author_id, 'APPLY', 0,
  '7월 레크리에이션 체조',
  '전 신체 가벼운 체조와 게임을 함께하는 레크리에이션입니다.',
  'OFFICE,CAREGIVER', 17, 'ACTIVE',
  DATE_ADD(@now, INTERVAL 10 DAY), DATE_ADD(@now, INTERVAL 35 DAY),
  30, 3, @now, @now
FROM DUAL
WHERE @facility_id IS NOT NULL AND @author_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `POST` WHERE `title` = '7월 레크리에이션 체조' AND `post_type` = 'APPLY'
  );

INSERT INTO `POST` (
  `facility_id`, `author_user_id`, `post_type`, `is_pinned`, `title`, `content`,
  `target_roles`, `views`, `post_status`, `start_at`, `end_at`,
  `capacity`, `current_enrolled`, `created_at`, `updated_at`
)
SELECT @facility_id, @author_id, 'APPLY', 0,
  '5월 미술 테라피 (마감)',
  '지난 달 진행된 미술 테라피 프로그램 모집 기록입니다.',
  'OFFICE,CAREGIVER', 41, 'ACTIVE',
  DATE_SUB(@now, INTERVAL 60 DAY), DATE_SUB(@now, INTERVAL 12 DAY),
  12, 12, @now, @now
FROM DUAL
WHERE @facility_id IS NOT NULL AND @author_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `POST` WHERE `title` = '5월 미술 테라피 (마감)' AND `post_type` = 'APPLY'
  );

INSERT INTO `POST` (
  `facility_id`, `author_user_id`, `post_type`, `is_pinned`, `title`, `content`,
  `target_roles`, `views`, `post_status`, `start_at`, `end_at`,
  `capacity`, `current_enrolled`, `created_at`, `updated_at`
)
SELECT @facility_id, @author_id, 'APPLY', 0,
  '인지 강화 보드게임 모임',
  '치매 예방 보드게임 프로그램. 소규모 10명 진행.',
  'OFFICE,CAREGIVER', 29, 'ACTIVE',
  DATE_SUB(@now, INTERVAL 1 DAY), DATE_ADD(@now, INTERVAL 21 DAY),
  10, 7, @now, @now
FROM DUAL
WHERE @facility_id IS NOT NULL AND @author_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `POST` WHERE `title` = '인지 강화 보드게임 모임' AND `post_type` = 'APPLY'
  );

INSERT INTO `POST` (
  `facility_id`, `author_user_id`, `post_type`, `is_pinned`, `title`, `content`,
  `target_roles`, `views`, `post_status`, `start_at`, `end_at`,
  `capacity`, `current_enrolled`, `created_at`, `updated_at`
)
SELECT @facility_id, @author_id, 'REVIEW', 0,
  '6월 음악 치료 활동 후기',
  '음악 치료 프로그램이 원활히 진행되었습니다. 참여 어르신 만족도가 높았습니다.',
  'OFFICE,CAREGIVER', 33, 'ACTIVE',
  NULL, NULL, NULL, NULL, @now, @now
FROM DUAL
WHERE @facility_id IS NOT NULL AND @author_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `POST` WHERE `title` = '6월 음악 치료 활동 후기' AND `post_type` = 'REVIEW'
  );

-- ---------------------------------------------------------------------------
-- 3) 프로그램 일정(SCHEDULE) — 목록 「일정」 컬럼용 (제목·본문 키로 매칭)
-- ---------------------------------------------------------------------------
INSERT INTO `SCHEDULE` (
  `facility_id`, `created_user_id`, `patient_id`, `title`, `content`,
  `schedule_type`, `scheduled_at`, `end_at`, `created_at`, `updated_at`
)
SELECT p.`facility_id`, @author_id, NULL, p.`title`, p.`content`, 'PROGRAM',
  DATE_ADD(COALESCE(p.`end_at`, @now), INTERVAL 3 DAY),
  DATE_ADD(COALESCE(p.`end_at`, @now), INTERVAL 3 DAY) + INTERVAL 2 HOUR,
  @now, @now
FROM `POST` p
WHERE p.`post_type` = 'APPLY'
  AND p.`facility_id` = @facility_id
  AND NOT EXISTS (
    SELECT 1 FROM `SCHEDULE` s
    WHERE s.`facility_id` = p.`facility_id`
      AND s.`schedule_type` = 'PROGRAM'
      AND s.`title` = p.`title`
      AND (s.`content` <=> p.`content`)
  );

UPDATE `SCHEDULE` s
INNER JOIN `POST` p
  ON s.`facility_id` = p.`facility_id`
 AND s.`title` = p.`title`
 AND (s.`content` <=> p.`content`)
 AND s.`schedule_type` = 'PROGRAM'
SET
  s.`scheduled_at` = DATE_ADD(COALESCE(p.`end_at`, @now), INTERVAL 3 DAY),
  s.`end_at` = DATE_ADD(COALESCE(p.`end_at`, @now), INTERVAL 3 DAY) + INTERVAL 2 HOUR,
  s.`updated_at` = @now
WHERE p.`post_type` = 'APPLY';

-- ---------------------------------------------------------------------------
-- 확인
-- ---------------------------------------------------------------------------
SELECT post_id, post_type, title, capacity, current_enrolled, start_at, end_at
FROM `POST`
WHERE post_type IN ('APPLY', 'REVIEW')
ORDER BY post_type, post_id;
