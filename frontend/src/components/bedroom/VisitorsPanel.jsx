import { useI18n } from "../../hooks/useI18n";

function VisitorsPanel() {
  const { t } = useI18n();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900">{t('visitors.title')}</h3>
      <p className="text-sm text-slate-600">
        {t('visitors.description')}
      </p>
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
        {t('visitors.noReservation')}
      </div>
    </section>
  );
}

export default VisitorsPanel;
