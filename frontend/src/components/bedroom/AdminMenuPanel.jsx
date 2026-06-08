import { useI18n } from '../../hooks/useI18n.jsx';

const MENU_KEYS = [
  'admin.quickMenu.settlement',
  'admin.quickMenu.certificate',
  'admin.quickMenu.discharge',
  'admin.quickMenu.insurance',
];

function AdminMenuPanel() {
  const { t } = useI18n();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900">{t('admin.quickMenu.title')}</h3>

      <div className="grid grid-cols-2 gap-3">
        {MENU_KEYS.map((key) => (
          <button
            key={key}
            className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            {t(key)}
          </button>
        ))}
      </div>
    </section>
  );
}

export default AdminMenuPanel;