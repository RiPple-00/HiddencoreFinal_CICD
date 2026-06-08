import { useI18n } from '../../hooks/useI18n.jsx';

const MENU_KEYS = [
  'bedSidebar.menu.overview',
  'bedSidebar.menu.vitalSigns',
  'bedSidebar.menu.prescriptions',
  'bedSidebar.menu.testResults',
  'bedSidebar.menu.nursingNotes',
  'bedSidebar.menu.medicalRecords',
];

function BedSidebar() {
  const { t } = useI18n();

  return (
    <aside className="w-[240px] rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-3xl font-bold text-slate-900">302호</h2>
        <p className="mt-1 text-sm text-slate-500">병동 A - 북측 윙</p>
      </div>

      <nav className="space-y-2">
        {MENU_KEYS.map((key, index) => (
          <button
            key={key}
            className={`w-full rounded-2xl px-4 py-3 text-left font-semibold ${
              index === 0
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t(key)}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default BedSidebar;