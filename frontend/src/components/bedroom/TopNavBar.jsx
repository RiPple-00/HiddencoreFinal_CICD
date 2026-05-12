import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AutoContext";

function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

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
 * @param {Object} props
 * @param {'rooms'|'patients'|'calendar'|'notice'} [props.activeNav]
 * @param {{ key: string, label: string, to: string | null }[]} [props.navItems]
 * @param {string} [props.brandLabel]
 * @param {string} [props.userName]
 * @param {string} [props.userRole]
 * @param {string} [props.searchPlaceholder]
 * @param {boolean} [props.showNotificationDot]
 */
function TopNavBar({
  activeNav = "rooms",
  navItems,
  brandLabel = "따숨",
  userName = "김관리자 (Admin Kim)",
  userRole = "SUPERUSER",
  searchPlaceholder = "환자 검색...",
  showNotificationDot = true,
}) {
  const { user } = useAuth();
  const token = user?.accessToken ?? user?.token;
  let facilityId = null;
  if (token && typeof token === "string") {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      facilityId = payload?.facilityId ?? null;
    } catch {
      facilityId = null;
    }
  }

  const defaultNavItems = [
    { key: "rooms", label: "병실 조회", to: "/ward" },
    { key: "patients", label: "환자 조회", to: "/patients" },
    { key: "calendar", label: "캘린더", to: "/schedule" },
    { key: "notice", label: "공지사항", to: facilityId ? `/facilities/${facilityId}/board` : null },
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
          <span className="shrink-0 text-lg font-bold text-[#2c52a1]">{brandLabel}</span>
          <nav className="ml-10 hidden items-center md:flex" aria-label="메인">
            {resolvedNavItems.map((item) => renderNavLink(item))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <label className="relative hidden sm:block">
            <span className="sr-only">환자 검색</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="h-10 w-[200px] rounded-full border-0 bg-[#f0f2f5] pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none ring-0 transition focus:bg-[#e8ebef] lg:w-[260px]"
            />
          </label>

          <div className="flex items-center gap-1 text-slate-600 md:gap-2">
            <button
              type="button"
              className="rounded-full p-2 transition hover:bg-slate-100"
              aria-label="메일"
            >
              <MailIcon className="text-slate-600" />
            </button>
            <button
              type="button"
              className="relative rounded-full p-2 transition hover:bg-slate-100"
              aria-label="알림"
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

export default TopNavBar;
