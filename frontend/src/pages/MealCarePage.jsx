import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import mealApi from "../api/mealApi";
import { normalizeMealListResponse, normalizeMealType } from "../utils/mealViewUtils";
import { useI18n } from "../hooks/useI18n";
import { useTranslatedTexts } from "../hooks/useTranslate";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const mealTypeToApiMap = {
  breakfast: "BREAKFAST",
  lunch: "LUNCH",
  dinner: "DINNER",
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
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState("lunch");
  // apiMealData: API에서 가져온 원본 한국어 데이터 (null = 미조회 or 데이터 없음)
  const [apiMealData, setApiMealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const todayKey = useMemo(() => formatToday(), []);

  // 기본값 — locale 번역키 사용 (이미 현재 언어로 출력됨, AI 번역 불필요)
  const defaultMealData = useMemo(() => ({
    breakfast: { name: t("meal.noMeal"), items: t("meal.noBreakfast") },
    lunch:     { name: t("meal.noMeal"), items: t("meal.noLunch") },
    dinner:    { name: t("meal.noMeal"), items: t("meal.noDinner") },
  }), [t]);

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await mealApi.getMealsByDate(todayKey);
        const rows = normalizeMealListResponse(response?.data);

        const next = {};
        MEAL_TYPES.forEach((type) => {
          const mealRow = rows.find(
            (row) => normalizeMealType(row) === mealTypeToApiMap[type]
          );
          const menuItems = splitMenuItems(mealRow?.menu);
          if (menuItems.length > 0) {
            next[type] = { name: menuItems[0], items: menuItems.join(", ") };
          }
        });

        // API 데이터가 하나라도 있으면 저장
        setApiMealData(Object.keys(next).length > 0 ? next : null);
      } catch (error) {
        console.error("식단 조회 실패:", error);
        setApiMealData(null);
        setErrorMessage(t("meal.loadError"));
      } finally {
        setLoading(false);
      }
    };
    loadMeals();
  }, [todayKey]);

  // API에서 온 한국어 문자열만 AI 번역 대상으로 수집
  const apiTexts = useMemo(() => {
    if (!apiMealData) return [];
    return MEAL_TYPES.flatMap((type) =>
      [apiMealData[type]?.name, apiMealData[type]?.items].filter(Boolean)
    );
  }, [apiMealData]);

  const getTranslatedMeal = useTranslatedTexts(apiTexts);

  // 현재 탭의 표시 데이터 (번역 적용)
  const getMealDisplay = (type) => {
    if (!apiMealData?.[type]) return defaultMealData[type];
    // ko이면 원본, 다른 언어면 AI 번역
    return {
      name: getTranslatedMeal(apiMealData[type].name),
      items: getTranslatedMeal(apiMealData[type].items),
    };
  };

  const meal = getMealDisplay(activeTab);

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-5 font-['Noto_Sans_KR',sans-serif] shadow-sm">
      <div className="mb-5 flex gap-5">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveTab(type)}
            className={`border-b-2 bg-transparent pb-1 text-[15px] transition-colors ${
              activeTab === type
                ? "border-[#1a9e75] font-bold text-[#1a9e75]"
                : "border-transparent font-normal text-slate-400"
            }`}
          >
            {t(`meal.${type}`)}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-slate-400">{todayKey} {t("meal.dateLabel")}</p>

      <h2 className="mb-2.5 text-[22px] font-extrabold text-slate-800">
        <Link to="/calendar" className="block w-full text-inherit no-underline">
          {loading ? t("meal.loading") : meal.name}
        </Link>
      </h2>

      <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-slate-500">
        {loading ? t("meal.loadingDetail") : meal.items}
      </p>

      {errorMessage && <p className="m-0 text-[13px] text-red-600">{errorMessage}</p>}
    </section>
  );
}
