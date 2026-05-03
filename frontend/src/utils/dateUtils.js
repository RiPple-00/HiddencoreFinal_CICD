/**
 * 날짜 표시: `Date` 인스턴스는 캘린더용 `YYYY-MM-DD`, 그 외(ISO 문자열 등)는 게시판 표시용 `YYYY.MM.DD`.
 */
export const formatDate = (dateOrStr) => {
  if (dateOrStr === undefined || dateOrStr === null || dateOrStr === '') {
    return '-';
  }
  const date =
    dateOrStr instanceof Date ? dateOrStr : new Date(dateOrStr);
  if (Number.isNaN(date.getTime())) return '-';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (dateOrStr instanceof Date) {
    return `${year}-${month}-${day}`;
  }
  return `${year}.${month}.${day}`;
};

export const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatMonthTitle = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}년 ${month}월`;
};

export const toDate = (value) => {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    // LocalDate "YYYY-MM-DD"는 UTC 자정으로 파싱되며 타임존에 따라 날짜가 하루 밀릴 수 있음 → 로컬 날짜로 고정
    const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
      const y = Number(ymd[1]);
      const m = Number(ymd[2]);
      const d = Number(ymd[3]);
      const dt = new Date(y, m - 1, d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh, mm, ss);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  if (typeof value === 'object') {
    const y = value.year ?? value.y;
    const m = value.monthValue ?? value.month ?? value.m;
    const d = value.dayOfMonth ?? value.day ?? value.d;
    const hh = value.hour ?? 0;
    const mm = value.minute ?? 0;
    const ss = value.second ?? 0;
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d, hh, mm, ss);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  return null;
};

export const toDateString = (value) => {
  const d = toDate(value);
  return d ? formatDate(d) : null;
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '-';

  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';

  return formatDate(dateStr);
};
