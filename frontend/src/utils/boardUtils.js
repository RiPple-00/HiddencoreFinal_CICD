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
  { labelKey: 'board.options.ALL', label: '전체 게시판', value: 'ALL' },
  { labelKey: 'board.options.NOTICE', label: '공지사항', value: 'NOTICE' },
  { labelKey: 'board.options.PROGRAM', label: '프로그램', value: 'PROGRAM' },
  { labelKey: 'board.options.GENERAL', label: '자유 게시판', value: 'GENERAL' }
];

export const BOARD_TYPE_MAP = {
  NOTICE: ['URGENT', 'CLINICAL', 'ADMIN', 'FACILITY'],
  PROGRAM: ['APPLY', 'REVIEW'],
  GENERAL: ['GENERAL'],
};

/* 게시판별 탭 목록 */
// key: BOARD_OPTIONS의 value와 일치
// type: Post 도메인의 PostType enum과 반드시 일치해야 함
export const BOARD_TABS_MAP = {
  NOTICE: [
    { labelKey: 'board.tabs.notice.all', label: '전체 공지', type: null },
    { labelKey: 'board.tabs.notice.urgent', label: '긴급 공지', type: 'URGENT' },
    { labelKey: 'board.tabs.notice.clinical', label: '임상 가이드라인', type: 'CLINICAL' },
    { labelKey: 'board.tabs.notice.admin', label: '행정 소식', type: 'ADMIN' },
    { labelKey: 'board.tabs.notice.facility', label: '시설 공지', type: 'FACILITY' },
  ],
  PROGRAM: [
    { labelKey: 'board.tabs.program.all', label: '전체', type: null },
    { labelKey: 'board.tabs.program.apply', label: '참여 신청', type: 'APPLY' },
    { labelKey: 'board.tabs.program.review', label: '활동 후기', type: 'REVIEW' },
  ],
  GENERAL: null,
};

/* 필터 옵션 (게시글 type 기준) */
export const FILTER_OPTIONS = [
  { labelKey: 'board.filter.all',    label: '전체',      value: null },
  { labelKey: 'board.filter.urgent', label: '긴급',      value: 'URGENT' },
  { labelKey: 'board.filter.clinical',label: '임상',     value: 'CLINICAL' },
  { labelKey: 'board.filter.admin',  label: '행정',      value: 'ADMIN' },
  { labelKey: 'board.filter.facility',label: '시설',     value: 'FACILITY' },
  { labelKey: 'board.filter.apply',  label: '참여 신청', value: 'APPLY' },
  { labelKey: 'board.filter.review', label: '활동 후기', value: 'REVIEW' },
  { labelKey: 'board.filter.general',label: '일반',      value: 'GENERAL' },
];

/* 정렬 옵션 */
export const SORT_OPTIONS = [
  { labelKey: 'board.sort.newest', label: '최신순',       value: 'newest' },
  { labelKey: 'board.sort.oldest', label: '오래된순',     value: 'oldest' },
  { labelKey: 'board.sort.views',  label: '조회수 많은순', value: 'views' },
  { labelKey: 'board.sort.alpha',  label: '제목순',       value: 'alpha' },
];

// 검색 타입 목록
export const SEARCH_TYPES = [
  { labelKey: 'search.type.all', label: '제목+내용', value: 'all' },
  { labelKey: 'search.type.title', label: '제목', value: 'title' },
  { labelKey: 'search.type.content', label: '내용', value: 'content' },
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
  { value: 'OFFICE', labelKey: 'board.targetRoles.OFFICE', label: '원무과' },
  { value: 'CAREGIVER', labelKey: 'board.targetRoles.CAREGIVER', label: '요양사' },
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
 * HTML `type="datetime-local"` 값 → KST wall-clock LocalDateTime JSON 문자열 (타임존 Z 없음)
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
export const datetimeLocalToKstApiString = (value) => {
  if (value == null || String(value).trim() === '') return null;
  const s = String(value).trim();
  const match = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?/);
  if (!match) return s.includes('T') ? s : null;
  return match[2] != null ? `${match[1]}:${match[2]}` : `${match[1]}:00`;
};

const pad2 = (n) => String(n).padStart(2, '0');

const KST = 'Asia/Seoul';

/**
 * 백엔드 LocalDateTime → `datetime-local` 입력값 (KST 기준 시·분)
 * @param {string|number[]|object|null|undefined} value
 * @returns {string}
 */
export const kstApiToDatetimeLocal = (value) => {
  if (value == null || value === '') return '';

  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0] = value;
    if (!y || !m || !d) return '';
    return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}`;
  }

  if (typeof value === 'object') {
    const y = value.year ?? value.y;
    const m = value.monthValue ?? value.month ?? value.m;
    const d = value.dayOfMonth ?? value.day ?? value.d;
    const hh = value.hour ?? 0;
    const mm = value.minute ?? 0;
    if (!y || !m || !d) return '';
    return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}`;
  }

  const str = String(value).trim();
  const naive = str.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (naive && !/Z$|[+-]\d{2}:\d{2}$/.test(str)) {
    return `${naive[1]}T${naive[2]}:${naive[3]}`;
  }

  const instant = new Date(str);
  if (Number.isNaN(instant.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(instant);

  const pick = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const year = pick('year');
  const month = pick('month');
  const day = pick('day');
  let hour = pick('hour');
  if (hour === '24') hour = '00';
  const minute = pick('minute');
  if (!year || !month || !day) return '';
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

/**
 * KST 기준 날짜·시간 라벨 (게시판 예약 일시 표시)
 * @param {string|number[]|object|null|undefined} value
 * @returns {string|null}
 */
export const formatDateTimeKst = (value) => {
  const local = kstApiToDatetimeLocal(value);
  if (!local) return null;
  const [datePart, timePart] = local.split('T');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('-');
  const [hh, mm] = timePart.split(':');
  return `${y}.${m}.${d} ${hh}:${mm}`;
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
