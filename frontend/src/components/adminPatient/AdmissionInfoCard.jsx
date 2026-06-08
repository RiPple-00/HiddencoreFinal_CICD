import { useI18n } from '../../hooks/useI18n';

export default function AdmissionInfoCard({ patient }) {
  const { t } = useI18n();
  const building = patient?.building || '-';
  const room = patient?.room || '-';
  const admission = patient?.admissionDate ? String(patient.admissionDate) : '-';

  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f4ff] text-[#2d5bff]">
          <span className="text-base leading-none">📅</span>
        </div>
        <h2 className="text-lg font-bold text-[#1a1f2e]">{t('admission.title')}</h2>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium text-slate-400">{t('admission.date')}</p>
          <p className="mt-1 font-semibold text-slate-800">{admission}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">{t('admission.ward')}</p>
          <p className="mt-1 font-semibold text-slate-800">
            {building} / {room}
          </p>
        </div>
      </div>
    </section>
  );
}
