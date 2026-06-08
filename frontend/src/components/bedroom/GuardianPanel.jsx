import { useI18n } from "../../hooks/useI18n";

function GuardianPanel() {
  const { t } = useI18n();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900">{t('guardian.patientManagement')}</h3>

      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-bold text-rose-600">{t('guardian.urgent')}</p>
        <p className="mt-2 text-lg font-bold text-slate-900">
          김철수 (301-A) 보호자
        </p>
        <p className="mt-1 text-sm text-slate-500">{t('guardian.status')} 시술 후 통증이 지속됨</p>

        <button className="mt-4 w-full rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700">
          {t('guardian.callNow')}
        </button>
      </div>
    </section>
  );
}

export default GuardianPanel;
