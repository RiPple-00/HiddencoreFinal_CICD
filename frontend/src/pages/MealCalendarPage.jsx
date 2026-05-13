import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import CalendarHeader from "../components/page/CalendarHeader";
import CalendarGrid from "../components/page/CalendarGrid";
import mealApi from "../api/mealApi";
import { useAuth } from "../contexts/AutoContext.jsx";
import { MEAL_TYPE_ORDER, normalizeMealListResponse, resolveFacilityId } from "../utils/mealViewUtils";

function CalendarPage({ embed = false }) {
  const today = new Date();
  const { user } = useAuth();
  const facilityId = useMemo(() => {
    const fromAuth = resolveFacilityId(user);
    if (fromAuth != null) return fromAuth;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return resolveFacilityId(JSON.parse(raw));
    } catch {
      return null;
    }
  }, [user]);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [filter, setFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  const handleDateClick = (dateString) => {
    setSelectedDate(dateString);
    navigate(`/meal-type/${dateString}`, { state: { selectedDate: dateString } });
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
      return;
    }
    setMonth((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
      return;
    }
    setMonth((prev) => prev + 1);
  };

  useEffect(() => {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

    mealApi
      .getMealsByRange(startDate, endDate, facilityId)
      .then((response) => {
        const raw = normalizeMealListResponse(response?.data);
        const mapped = raw.map((meal) => {
          const mt = String(meal.mealType ?? meal.meal_type ?? "").toUpperCase();
          const typeLabel =
            mt === "BREAKFAST"
              ? "아침"
              : mt === "LUNCH"
                ? "점심"
                : mt === "DINNER"
                  ? "저녁"
                  : mt || "식단";

          const menuPreview = meal.menu
            ? String(meal.menu).split(",")[0].trim().substring(0, 15)
            : "식단";

          const title = `${typeLabel} ${menuPreview}`;

          return {
            scheduleId: meal.mealPlanId ?? `${meal.mealDate}-${mt}-${meal.dietType ?? meal.diet_type ?? ""}`,
            title,
            scheduledAt: meal.mealDate,
            mealType: mt,
            type: "PERSONAL",
          };
        });

        mapped.sort((a, b) => {
          const da = String(a.scheduledAt ?? "");
          const db = String(b.scheduledAt ?? "");
          if (da !== db) return da.localeCompare(db);
          return (
            (MEAL_TYPE_ORDER[a.mealType] ?? 99) - (MEAL_TYPE_ORDER[b.mealType] ?? 99)
          );
        });

        setSchedules(mapped);
      })
      .catch((error) => {
        console.error("캘린더 식단 조회 실패", error);
        setSchedules([]);
      });
  }, [year, month, facilityId]);

  const shellStyle = { fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' };

  const body = (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">식단 캘린더</h1>
            <p className="mt-2 text-sm text-slate-600">
              식단 계획을 확인하거나 날짜를 선택해보세요.
            </p>
          </div>
          <Link
            to="/meal-upload"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            식단 등록
          </Link>
        </div>
      </div>

      <CalendarHeader
        year={year}
        month={month}
        filter={filter}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onFilterChange={setFilter}
      />

      <div className="mt-6">
        <CalendarGrid
          year={year}
          month={month}
          schedules={schedules}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />
      </div>
    </div>
  );

  if (embed) {
    return body;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={shellStyle}>
      <Header activeNav="calendar" />
      <div className="mx-auto w-full max-w-6xl px-4 py-6">{body}</div>
    </div>
  );
}

export default CalendarPage;
