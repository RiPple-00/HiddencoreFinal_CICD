import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import ScheduleCalendarPage from "./ScheduleCalendarPage";
import MealCalendarPage from "./MealCalendarPage";

const shellFont = { fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' };

/**
 * 상단 네비「캘린더」진입 시 일정 / 식단 탭으로 두 캘린더를 전환합니다.
 * - `/schedule` → 일정 탭(기본)
 * - `/calendar` → 식단 탭(기존 식단 캘린더 URL 유지)
 */
export default function CalendarHubPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = location.pathname === "/calendar" ? "meal" : "schedule";

  const tabBtn =
    "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c52a1] focus-visible:ring-offset-2";

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={shellFont}>
      <Header activeNav="calendar" />
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div
          className="mb-5 flex rounded-xl border border-gray-200 bg-slate-100/90 p-1 shadow-sm"
          role="tablist"
          aria-label="캘린더 종류"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "schedule"}
            id="calendar-tab-schedule"
            className={`${tabBtn} ${
              tab === "schedule"
                ? "bg-white text-[#2c52a1] shadow-sm ring-1 ring-gray-200/70"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            }`}
            onClick={() => navigate("/schedule")}
          >
            일정
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "meal"}
            id="calendar-tab-meal"
            className={`${tabBtn} ${
              tab === "meal"
                ? "bg-white text-[#2c52a1] shadow-sm ring-1 ring-gray-200/70"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            }`}
            onClick={() => navigate("/calendar")}
          >
            식단
          </button>
        </div>

        <div role="tabpanel" aria-labelledby={tab === "schedule" ? "calendar-tab-schedule" : "calendar-tab-meal"}>
          {tab === "schedule" ? <ScheduleCalendarPage embed /> : <MealCalendarPage embed />}
        </div>
      </div>
    </div>
  );
}
