import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AutoContext.jsx";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import { useI18n } from "../../hooks/useI18n.jsx";
import { resolveStaffFacilityId } from "../../utils/jwtUtils";

// function SearchIcon({ className }) {
//   return (
//     <svg
//       className={className}
//       width="18"
//       height="18"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       aria-hidden
//     >
//       <circle cx="11" cy="11" r="8" />
//       <path d="m21 21-4.3-4.3" />
//     </svg>
//   );
// }

function MailIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function BellIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

/**
 * 원무과·공통 상단 네비 (따숨, 병실/입소자/캘린더/공지, 검색, 알림, 프로필).
 * @param {'rooms'|'patients'|'calendar'|'notice'} [activeNav]
 * @param {{ key: string, label: string, to: string | null }[]} [navItems]
 * @param {string} [brandLabel]
 * @param {string} [brandTo] — 지정 시 브랜드(따숨) 클릭 시 이동 경로
 * @param {string} [userName]
 * @param {string} [userRole]
// @param {string} [searchPlaceholder]
 * @param {boolean} [showNotificationDot]
 */
export default function Header({
  activeNav = "rooms",
  navItems,
  brandLabel = "따숨",
  brandTo = "/ward",
  userName = "김관리자 (Admin Kim)",
  userRole = "SUPERUSER",
  // searchPlaceholder,
  showNotificationDot = true,
}) {
  const { user } = useAuth();
  const facilityId = resolveStaffFacilityId(user);
  const { language, setLanguage } = useLanguage();
  const { t } = useI18n();
  const languageOptions = [
    { value: "ko", label: t('label.korean') },
    { value: "en", label: t('label.english') },
    { value: "ja", label: t('label.japanese') },
  ];

  const defaultNavItems = [
    { key: "rooms", label: t('nav.rooms'), to: "/ward" },
    { key: "patients", label: t('nav.patients'), to: "/patients" },
    { key: "calendar", label: t('nav.calendar'), to: "/schedule" },
    { key: "notice", label: t('nav.notice'), to: facilityId ? `/facilities/${facilityId}/board` : null },
    { key: "visits", label: "면회 관리", to: "/visit-management" },
  ];
  const resolvedNavItems = navItems ?? defaultNavItems;

  const renderNavLink = (item) => {
    const isActive = item.key === activeNav;
    const base =
      "relative whitespace-nowrap text-[15px] font-medium transition-colors after:absolute after:-bottom-[10px] after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-[#2c52a1] after:transition-transform";
    const activeCls = isActive
      ? `text-[#2c52a1] after:scale-x-100`
      : `text-[#666666] hover:text-slate-900`;
    const spacing = "ml-8 first:ml-0";

    if (item.to) {
      return (
        <Link key={item.key} to={item.to} className={`${base} ${activeCls} ${spacing}`}>
          {item.label}
        </Link>
      );
    }

    return (
      <span key={item.key} className={`${base} ${activeCls} ${spacing} cursor-default`}>
        {item.label}
      </span>
    );
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-[#e0e0e0] bg-white"
      style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}
    >
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-5">
        <div className="flex min-w-0 flex-1 items-center">
          {brandTo ? (
            <Link
              to={brandTo}
              className="shrink-0 text-lg font-bold text-[#2c52a1] transition hover:text-[#1e3d7a]"
            >
              {brandLabel}
            </Link>
          ) : (
            <span className="shrink-0 text-lg font-bold text-[#2c52a1]">{brandLabel}</span>
          )}
          <nav className="ml-10 hidden items-center md:flex" aria-label="메인">
            {resolvedNavItems.map((item) => renderNavLink(item))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <label className="relative hidden sm:block">
            <span className="sr-only">{t('aria.searchPatients')}</span>
            {/* <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" /> */}
            {/* <input
              type="search"
              placeholder={searchPlaceholder || t('search.placeholder')}
              className="h-10 w-[200px] rounded-full border-0 bg-[#f0f2f5] pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none ring-0 transition focus:bg-[#e8ebef] lg:w-[260px]"
            /> */}
          </label>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2 text-sm text-slate-700">
            <span className="whitespace-nowrap">{t('label.language')}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="bg-transparent text-sm outline-none"
              aria-label={t('label.language')}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-slate-600 md:gap-2">
            <button
              type="button"
              className="rounded-full p-2 transition hover:bg-slate-100"
              aria-label={t('aria.mail')}
            >
              <MailIcon className="text-slate-600" />
            </button>
            <button
              type="button"
              className="relative rounded-full p-2 transition hover:bg-slate-100"
              aria-label={t('aria.notifications')}
            >
              <BellIcon className="text-slate-600" />
              {showNotificationDot && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
          </div>

          <div className="mx-1 hidden h-8 w-px bg-[#e0e0e0] sm:block" />

          <div className="flex items-center gap-3 pl-1">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-bold text-slate-900">{userName}</p>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">{userRole}</p>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4a6fc5] to-[#2c52a1] text-sm font-bold text-white"
              role="img"
              aria-label="프로필"
            >
              김
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
