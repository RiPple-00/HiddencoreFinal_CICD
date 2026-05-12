import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import mealApi from "@/api/mealApi";
import { normalizeMealListResponse, normalizeMealType } from "../utils/mealViewUtils";

const tabs = ["아침", "점심", "저녁"];

const mealTypeMap = {
  아침: "BREAKFAST",
  점심: "LUNCH",
  저녁: "DINNER",
};

const defaultMealData = {
  아침: {
    name: "등록된 식단 없음",
    items: "오늘 등록된 아침 식단이 없습니다.",
    special: false,
  },
  점심: {
    name: "등록된 식단 없음",
    items: "오늘 등록된 점심 식단이 없습니다.",
    special: false,
  },
  저녁: {
    name: "등록된 식단 없음",
    items: "오늘 등록된 저녁 식단이 없습니다.",
    special: false,
  },
};

const formatToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const splitMenuItems = (menu) => {
  if (!menu) return [];

  return String(menu)
    .split(/,|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function MealCardPage() {
  const [activeTab, setActiveTab] = useState("점심");
  const [mealData, setMealData] = useState(defaultMealData);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const todayKey = useMemo(() => formatToday(), []);

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await mealApi.getMealsByDate(todayKey);
        const rows = normalizeMealListResponse(response?.data);

        const nextMealData = { ...defaultMealData };

        tabs.forEach((tab) => {
          const mealRow = rows.find((row) => normalizeMealType(row) === mealTypeMap[tab]);
          const menuItems = splitMenuItems(mealRow?.menu);

          if (menuItems.length > 0) {
            nextMealData[tab] = {
              name: menuItems[0],
              items: menuItems.join(", "),
              special: false,
            };
          }
        });

        setMealData(nextMealData);
      } catch (error) {
        console.error("식단 조회 실패:", error);
        setMealData(defaultMealData);
        setErrorMessage("식단을 불러오지 못했습니다. 엑셀 업로드 후 다시 확인하세요.");
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, [todayKey]);

  const meal = mealData[activeTab];

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-5 font-['Noto_Sans_KR',sans-serif] shadow-sm">
      <div className="mb-5 flex gap-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 bg-transparent pb-1 text-[15px] transition-colors ${
              activeTab === tab
                ? "border-[#1a9e75] font-bold text-[#1a9e75]"
                : "border-transparent font-normal text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-slate-400">{todayKey} 식단</p>

      <h2 className="mb-2.5 text-[22px] font-extrabold text-slate-800">
        <Link
          to="/calendar"
          className="block w-full text-inherit no-underline"
          title="캘린더로 이동"
        >
          {loading ? "식단 불러오는 중..." : meal.name}
        </Link>
      </h2>

      <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-slate-500">
        {loading ? "업로드된 식단 정보를 확인하고 있습니다." : meal.items}
      </p>

      {errorMessage && <p className="m-0 text-[13px] text-red-600">{errorMessage}</p>}
    </section>
  );
}
