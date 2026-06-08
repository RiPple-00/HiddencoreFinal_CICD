import { useI18n } from '../../hooks/useI18n';

export default function GuardianAlertCard() {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-[#fecaca] bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-lg font-bold text-slate-900">{t('guardian.management')}</h3>
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-bold text-[#e53e3e]">{t('guardian.urgent')}</p>
        <p className="mt-2 text-base font-bold text-slate-900">김철수 (301-A) 보호자</p>
        <p className="mt-1 text-sm text-slate-600">미서명 동의서 · 즉시 연락 필요</p>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-[#e53e3e] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#dc2626]"
        >
          {t('guardian.callNow')}
        </button>
      </div>
    </section>
  );
}
