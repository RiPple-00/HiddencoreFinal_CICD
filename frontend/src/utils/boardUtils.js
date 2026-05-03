// 게시판 관련 상수 및 유틸 함수 모음

/* ---------------------------------- 상수 ---------------------------------- */

// 페이지당 노출 게시글 수
export const PAGE_SIZE = 20;

// 메인 페이지 위젯 노출 게시글 수
export const WIDGET_SIZE = 2;

// CHECK!!! HOT 배지 기준 조회수 - 추후 수치 확정 후 주석 해제
// export const HOT_THRESHOLD = 500;

/* 게시판 드롭다운 목록 (헤더 ▽ 버튼으로 선택) */
// value: BOARD_TABS_MAP의 키와 반드시 일치해야 함
// CHECK!!! 게시판 종류 세분화 시 항목 및 BOARD_TABS_MAP 동시 추가
export const BOARD_OPTIONS = [
  { label: '전체 게시판', value: 'ALL' },
  { label: '공지사항', value: 'NOTICE' },
  { label: '프로그램', value: 'PROGRAM' },
  { label: '자유 게시판', value: 'GENERAL' }
];

export const BOARD_TYPE_MAP = {
  NOTICE: ['URGENT', 'CLINICAL', 'ADMIN', 'FACILITY'],
  PROGRAM: ['APPLY', 'REVIEW'],
  GENERAL: ['GENERAL'],
};

/* 게시판별 탭 목록 */
// key: BOARD_OPTIONS의 value와 일치
// type: Post 도메인의 PostType enum과 반드시 일치해야 함 // CHECK!!! 아직 추가 안함!!! 회의 후 정해보기~~
// CHECK!!! PostType 세분화 시 해당 게시판 탭에 항목 추가
export const BOARD_TABS_MAP = {
  NOTICE: [
    { label: '전체 공지', type: null },
    { label: '긴급 공지', type: 'URGENT' },
    { label: '임상 가이드라인', type: 'CLINICAL' },
    { label: '행정 소식', type: 'ADMIN' },
    { label: '시설 공지', type: 'FACILITY' },
  ],
  PROGRAM: [
    { label: '전체', type: null },
    { label: '참여 신청', type: 'APPLY' },
    { label: '활동 후기', type: 'REVIEW' },
  ],
  GENERAL: null,
};

// 검색 타입 목록
export const SEARCH_TYPES = [
  { label: '제목+내용', value: 'all' },
  { label: '제목', value: 'title' },
  { label: '내용', value: 'content' },
];

// StatusBadge type별 스타일 정의
// label: 화면에 표시될 텍스트 -> DB에 type으로 넘길 예정
// className: Tailwind 클래스 (배경색 + 글자색)
export const BADGE_STYLES = {
  URGENT: { label: '긴급', className: 'bg-red-100 text-red-700' },
  CLINICAL: { label: '임상', className: 'bg-green-100 text-green-700' },
  ADMIN: { label: '행정', className: 'bg-gray-100 text-gray-600' },
  FACILITY: { label: '시설', className: 'bg-orange-100 text-orange-700' },
  APPLY: { label: '참여신청', className: 'bg-blue-100 text-blue-700' },
  REVIEW: { label: '활동후기', className: 'bg-yellow-100 text-yellow-700' },
  GENERAL: { label: '일반', className: 'bg-gray-100 text-gray-500' },
  // CHECK!!! HOT 배지 - 추후 조회수 기준 확정 후 주석 해제
  // HOT: { label: 'HOT', className: 'bg-red-500 text-white' },
};

/* ---------------------------------- 함수 ---------------------------------- */

/**
 * type에 해당하는 배지 스타일을 반환
 * 정의되지 않은 type이 들어오면 GENERAL 스타일로 fallback
 * @param {string} type - BADGE_STYLES에 정의된 type 값
 * @returns {{ label: string, className: string }}
 */
export const getBadgeStyle = (type) => {
  return BADGE_STYLES[type] ?? BADGE_STYLES.GENERAL;
};

/**
 * 검색 타입 값에 해당하는 한글 라벨 반환
 * @param {string} value - 'all' | 'title' | 'content'
 * @returns {string}
 */
export const getSearchTypeLabel = (value) => {
  const map = { all: '제목+내용', title: '제목', content: '내용' };
  return map[value] ?? '제목+내용';
};

// CHECK!!! HOT 배지 - 추후 조회수 기준 확정 후 주석 해제
// export const isHotPost = (views) => views >= HOT_THRESHOLD;

/** PostStatus (백엔드 `Post.PostStatus`와 동일) */
export const POST_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  RESERVE: 'RESERVE',
};

/** 공지 작성 시 공개 대상 체크박스 */
export const TARGET_ROLES = [
  { value: 'DOCTOR', label: '의사' },
  { value: 'CAREGIVER', label: '간병인' },
  { value: 'STAFF', label: '시설 직원' },
];

/**
 * 공개 대상 배열 → DB 저장 문자열 ("DOCTOR,CAREGIVER")
 * @param {string[]} roles
 */
export const stringifyTargetRoles = (roles) => {
  if (!roles || !Array.isArray(roles)) return '';
  return roles.filter(Boolean).join(',');
};

/**
 * 첨부 URL 배열 → DB JSON 문자열
 * @param {string[]} urls
 */
export const stringifyAttachmentUrls = (urls) => {
  if (!urls || !Array.isArray(urls)) return '[]';
  try {
    return JSON.stringify(urls);
  } catch {
    return '[]';
  }
};

/**
 * DB의 attachment_urls(JSON 문자열) → URL 배열
 * @param {string|null|undefined} attachmentUrls
 * @returns {string[]}
 */
export const parseAttachmentUrls = (attachmentUrls) => {
  if (!attachmentUrls) return [];
  if (Array.isArray(attachmentUrls)) return attachmentUrls;
  if (typeof attachmentUrls !== 'string') return [];
  try {
    const parsed = JSON.parse(attachmentUrls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * 작성 UI(공지/프로그램) → 백엔드 Post.PostType enum 값
 * (NOTICE/PROGRAM 문자열은 DB enum에 없음)
 */
export const BOARD_UI_TO_POST_TYPE = {
  PROGRAM: 'APPLY',
  GENERAL: 'GENERAL',
};

/**
 * HTML `type="date"` 값(YYYY-MM-DD)을 백엔드 `LocalDateTime` JSON 역직렬화용 ISO 문자열로 변환
 * @param {string|null|undefined} value
 * @param {boolean} endOfDay - 종료일이면 해당 일 23:59:59
 * @returns {string|null}
 */
export const dateOnlyToLocalDateTimeString = (value, endOfDay = false) => {
  if (value == null || String(value).trim() === '') return null;
  const s = String(value).trim();
  if (s.includes('T')) return s;
  return endOfDay ? `${s}T23:59:59` : `${s}T00:00:00`;
};
