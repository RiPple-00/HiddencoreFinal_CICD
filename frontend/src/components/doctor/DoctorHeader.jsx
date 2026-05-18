import Header from '../common/Header';

/** 의사 화면 공통 상단 네비 (병동 관리 제외 · 캘린더·게시판은 미구현) */
export const DOCTOR_NAV_ITEMS = [
  { key: 'patients', label: '환자 관리', to: '/doctor/patients' },
  { key: 'calendar', label: '캘린더', to: null },
  { key: 'notice', label: '게시판', to: null },
];

/**
 * @param {'patients'|'calendar'|'notice'} [activeNav] — 현재 강조할 탭 (메인은 생략)
 * @param {string} [userName]
 * @param {string} [userRole]
 */
export default function DoctorHeader({
  activeNav,
  userName = '김관리자 (Admin Kim)',
  userRole = 'SUPERUSER',
  searchPlaceholder = '환자 검색...',
  showNotificationDot = true,
}) {
  return (
    <Header
      activeNav={activeNav}
      navItems={DOCTOR_NAV_ITEMS}
      brandLabel="따숨"
      brandTo="/doctor"
      userName={userName}
      userRole={userRole}
      searchPlaceholder={searchPlaceholder}
      showNotificationDot={showNotificationDot}
    />
  );
}
