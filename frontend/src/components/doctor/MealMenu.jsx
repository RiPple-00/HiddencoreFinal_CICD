import { useEffect, useMemo, useState } from 'react';
import mealApi from '../../api/mealApi';
import { useAuth } from '../../contexts/AutoContext';
import {
  mapMealRowsToSlots,
  normalizeMealListResponse,
  resolveFacilityId,
} from '../../utils/mealViewUtils';

const TABS = [
  { key: 'breakfast', label: '아침', en: 'Breakfast' },
  { key: 'lunch', label: '점심', en: 'Lunch' },
  { key: 'dinner', label: '저녁', en: 'Dinner' },
];

function formatToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function splitMenuItems(menu) {
  if (!menu) return [];
  return String(menu)
    .split(/,|\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function menuDisplay(menu) {
  const items = splitMenuItems(menu);
  if (items.length === 0) {
    return {
      title: '등록된 식단 없음',
      detail: '오늘 해당 끼니 식단이 등록되지 않았습니다.',
      empty: true,
    };
  }
  return {
    title: items[0],
    detail: items.join(', '),
    empty: false,
  };
}

const defaultSlots = () => ({
  breakfast: { menu: '', mealType: 'BREAKFAST', calorie: null, protein: null },
  lunch: { menu: '', mealType: 'LUNCH', calorie: null, protein: null },
  dinner: { menu: '', mealType: 'DINNER', calorie: null, protein: null },
});

export default function MealMenu() {
  const { user } = useAuth();
  const facilityId = useMemo(() => resolveFacilityId(user), [user]);
  const todayKey = useMemo(() => formatToday(), []);

  const [activeTab, setActiveTab] = useState('lunch');
  const [slots, setSlots] = useState(defaultSlots);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await mealApi.getMealsByDate(todayKey, facilityId);
        if (cancelled) return;
        const rows = normalizeMealListResponse(res?.data);
        setSlots(mapMealRowsToSlots(rows));
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setSlots(defaultSlots());
          setError('식단을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [todayKey, facilityId]);

  const current = slots[activeTab] ?? { menu: '' };
  const { title, detail, empty } = menuDisplay(current.menu);
  const activeMeta = TABS.find((t) => t.key === activeTab);

  return (
    <div className="rounded-xl border border-[#dde4ee] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[32px] font-bold text-[#232f42]">구내 식당 메뉴</h3>
        <span className="text-xs font-semibold text-slate-400">TODAY</span>
      </div>

      <div className="mb-2 flex items-center gap-4 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`bg-transparent transition-colors ${
              activeTab === tab.key
                ? 'font-semibold text-[#35a5bf]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.en}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-slate-400">
        {todayKey.replace(/-/g, '.')} · {activeMeta?.label ?? ''}
      </p>

      {loading ? (
            <p className="text-sm text-slate-400">식단 불러오는 중…</p>
          ) : (
            <>
              <p className="text-[28px] font-bold leading-snug text-slate-900">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>
              {!empty && (current.calorie != null || current.protein != null) ? (
                <p className="mt-3 text-xs text-slate-400">
                  {current.calorie != null ? `칼로리 ${current.calorie}kcal` : ''}
                  {current.calorie != null && current.protein != null ? ' · ' : ''}
                  {current.protein != null ? `단백질 ${current.protein}g` : ''}
                </p>
              ) : null}
              {!empty ? (
                <p className="mt-4 text-xs font-semibold text-[#2c95a9]">🥗 SPECIAL DIET AVAILABLE</p>
              ) : null}
            </>
          )}
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
