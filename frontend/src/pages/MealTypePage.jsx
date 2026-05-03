import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import mealApi from "../api/mealApi";
import { mapMealRowsToSlots, normalizeMealListResponse, toIsoDateKey } from "../utils/mealViewUtils";

const sideMenus = [
  "대시보드",
  "환자 기록",
  "식단 플래너",
  "재고 관리",
  "분석",
];

const splitMenuItems = (menu) => {
  if (!menu) return [];

  return String(menu)
    .split(/,|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function MealType() {
  const { date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDate = toIsoDateKey(location.state?.selectedDate || date || "");
  const [mealData, setMealData] = useState({
    breakfast: { menu: "", mealType: "BREAKFAST", calorie: null, protein: null },
    lunch: { menu: "", mealType: "LUNCH", calorie: null, protein: null },
    dinner: { menu: "", mealType: "DINNER", calorie: null, protein: null },
  });

  const formatKoreanDate = (dateString) => {
    if (!dateString) return "04월08일 (수)";
    const iso = toIsoDateKey(dateString);
    const parts = iso.split("-");
    if (parts.length < 3) return "04월08일 (수)";
    const y = Number(parts[0]);
    const mo = Number(parts[1]);
    const d = Number(parts[2]);
    if ([y, mo, d].some((n) => Number.isNaN(n))) return "04월08일 (수)";
    const parsed = new Date(y, mo - 1, d);
    if (Number.isNaN(parsed.getTime())) return "04월08일 (수)";

    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const dayOfWeek = days[parsed.getDay()];

    return `${month}월${day}일 (${dayOfWeek})`;
  };

  const displayDate = formatKoreanDate(selectedDate);
  const parsedSelectedDate = selectedDate
    ? (() => {
        const p = selectedDate.split("-").map(Number);
        return new Date(p[0], p[1] - 1, p[2]);
      })()
    : null;
  const displayMonth =
    parsedSelectedDate && !Number.isNaN(parsedSelectedDate.getTime())
      ? `${parsedSelectedDate.getFullYear()}년 ${parsedSelectedDate.getMonth() + 1}월`
      : "2025년 4월";

  const activeDateKey = useMemo(() => {
    if (selectedDate) return toIsoDateKey(selectedDate);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const activeMealCards = useMemo(() => {
    const typeLabel = {
      BREAKFAST: "아침 식사",
      LUNCH: "점심 식사",
      DINNER: "저녁 식사",
    };

    const breakfastItems = splitMenuItems(mealData.breakfast.menu);
    const lunchItems = splitMenuItems(mealData.lunch.menu);
    const dinnerItems = splitMenuItems(mealData.dinner.menu);

    return [
      {
        type: typeLabel.BREAKFAST,
        mealType: "BREAKFAST",
        menu: mealData.breakfast.menu,
        calorie: mealData.breakfast.calorie,
        protein: mealData.breakfast.protein,
        description: breakfastItems.length ? breakfastItems : (mealData.breakfast.menu
          ? mealData.breakfast.menu.split(",").map((item) => item.trim())
          : []),
      },
      {
        type: typeLabel.LUNCH,
        mealType: "LUNCH",
        menu: mealData.lunch.menu,
        calorie: mealData.lunch.calorie,
        protein: mealData.lunch.protein,
        description: lunchItems.length ? lunchItems : (mealData.lunch.menu
          ? mealData.lunch.menu.split(",").map((item) => item.trim())
          : []),
        featured: true,
      },
      {
        type: typeLabel.DINNER,
        mealType: "DINNER",
        menu: mealData.dinner.menu,
        calorie: mealData.dinner.calorie,
        protein: mealData.dinner.protein,
        description: dinnerItems.length ? dinnerItems : (mealData.dinner.menu
          ? mealData.dinner.menu.split(",").map((item) => item.trim())
          : []),
      },
    ];
  }, [mealData]);

  useEffect(() => {
    const loadByDate = async () => {
      if (!activeDateKey || !/^\d{4}-\d{2}-\d{2}$/.test(activeDateKey)) {
        return;
      }
      try {
        const response = await mealApi.getMealsByDate(activeDateKey);
        const rows = normalizeMealListResponse(response?.data);

        setMealData(mapMealRowsToSlots(rows));
      } catch (error) {
        console.error("식단 조회 실패:", error);
        setMealData({
          breakfast: { menu: "", mealType: "BREAKFAST", calorie: null, protein: null },
          lunch: { menu: "", mealType: "LUNCH", calorie: null, protein: null },
          dinner: { menu: "", mealType: "DINNER", calorie: null, protein: null },
        });
      }
    };

    loadByDate();
  }, [activeDateKey]);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[#d7e6ff] bg-[#f8fbff] text-slate-900 shadow-sm">
      <div className="flex min-h-[640px]">
        <aside className="w-[230px] border-r border-[#d7e6ff] bg-white">
          <div className="border-b border-[#d7e6ff] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a4fd7] text-white">
                🏥
              </div>
              <div>
                <p className="text-sm font-bold text-[#1153cb]">따숨</p>
                <p className="text-xs text-slate-400">따숨 영양팀</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-4">
            {sideMenus.map((menu) => (
              <button
                key={menu}
                className={`mb-1 flex w-full items-center rounded-lg px-3 py-2 text-sm ${
                  menu === "식단 플래너"
                    ? "bg-[#eaf2ff] font-semibold text-[#1553c8]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="mr-2 text-xs">■</span>
                {menu}
              </button>
            ))}
          </div>

          <div className="px-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/meal-upload")}
              className="block w-full cursor-pointer rounded-lg bg-[#0052d9] py-3 text-center text-sm font-semibold text-white"
            >
              + 식단 등록
            </button>
          </div>

          <div className="mt-auto px-4 pb-7 pt-10 text-sm text-slate-500">
            <p className="mb-2">설정</p>
            <p>고객 지원</p>
          </div>
        </aside>

        <main className="flex-1 px-5 py-4">
          <header className="mb-4 flex items-center gap-4 rounded-xl bg-white px-5 py-3 shadow-sm">
            <input
              readOnly
              value="식단, 환자명 또는 영양소 검색..."
              className="h-10 flex-1 rounded-full border border-[#e3ecfb] bg-[#f8fbff] px-4 text-sm text-slate-400"
            />
            <span>🔔</span>
            <span>🕒</span>
            <div className="ml-2 flex items-center gap-2">
              <p className="text-sm font-semibold">김시우 박사</p>
              <div className="h-8 w-8 rounded-full bg-amber-300" />
            </div>
          </header>

          <div className="mb-4 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black">{displayDate}</h1>
            </div>
            <button className="rounded-lg border border-[#dbe7fa] bg-white px-4 py-2 text-sm font-semibold">
              {displayMonth}
            </button>
          </div>

          <div>
            {activeMealCards.map((meal) => {
              const mealTitle = meal.description[0] || "식단 없음";

              return (
                <article
                  key={meal.type}
                  className={`mb-4 rounded-2xl border bg-white ${
                    meal.featured
                      ? "border-[#8fb0ef] shadow-[0_10px_30px_rgba(61,113,203,0.18)]"
                      : "border-[#e6edf8]"
                  }`}
                >
                  <div className="p-5">
                    <span className="rounded-md bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#5273ad]">
                      {meal.type}
                    </span>
                    <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900">
                      {mealTitle}
                    </h2>
                    <div className="mt-5 rounded-lg bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">메뉴</p>
                      <ul className="space-y-2">
                        {meal.description.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                            <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {(meal.calorie != null || meal.protein != null) && (
                      <div className="mt-5 flex gap-4 rounded-lg bg-blue-50 p-4">
                        {meal.calorie != null && (
                          <div className="flex-1">
                            <p className="text-xs text-slate-500">열량</p>
                            <p className="text-2xl font-bold text-blue-600">{meal.calorie}</p>
                            <p className="text-xs text-slate-500">kcal</p>
                          </div>
                        )}
                        {meal.protein != null && (
                          <div className="flex-1">
                            <p className="text-xs text-slate-500">단백질</p>
                            <p className="text-2xl font-bold text-blue-600">{meal.protein}</p>
                            <p className="text-xs text-slate-500">g</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
