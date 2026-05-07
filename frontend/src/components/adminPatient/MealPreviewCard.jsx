import { useMemo, useState } from 'react';

const TABS = [
  { key: 'BREAKFAST', label: 'Breakfast' },
  { key: 'LUNCH', label: 'Lunch' },
  { key: 'DINNER', label: 'Dinner' },
];

function splitMenu(menu) {
  if (!menu) return [];
  const s = String(menu);
  return s
    .split(/[,/|·\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function MealPreviewCard({ patient, meals = [] }) {
  const [tab, setTab] = useState('LUNCH');

  const matched = useMemo(() => {
    const list = Array.isArray(meals) ? meals : [];
    const dietType = patient?.dietType ?? null;
    const byType = list.filter((m) => (m?.mealType || '').toUpperCase() === tab);
    if (!dietType) return byType[0] ?? null;
    const exact = byType.find((m) => String(m?.dietType) === String(dietType));
    return exact ?? byType[0] ?? null;
  }, [meals, patient?.dietType, tab]);

  const title = matched?.menu ? splitMenu(matched.menu)[0] ?? matched.menu : '식단 정보 없음';
  const sides = matched?.menu ? splitMenu(matched.menu).slice(1, 6) : [];

  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <div className="mb-4 flex gap-1 rounded-xl bg-[#f7f8fa] p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              tab === key ? 'bg-white text-[#2d5bff] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      {sides.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          {sides.map((s) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-slate-500">표시할 메뉴가 없습니다.</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
          SPECIAL DIET AVAILABLE
        </span>
        {patient?.dietType ? <span className="text-xs text-slate-500">{patient.dietType}</span> : null}
      </div>
    </section>
  );
}