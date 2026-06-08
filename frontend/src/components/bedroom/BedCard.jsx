import { useI18n } from "../../hooks/useI18n";

function BedCard({ bed, onAssignClick, onBedClick }) {
  const { t } = useI18n();

  const genderLabel = (() => {
    if (bed.gender === 'MALE') return t('patient.gender.maleFull');
    if (bed.gender === 'FEMALE') return t('patient.gender.femaleFull');
    if (bed.gender === 'OTHER') return t('patient.gender.other');
    return bed.gender || '-';
  })();

  if (!bed.occupied) {
    if (bed.isVirtual || !bed.locationId) {
      return (
        <div className="flex min-h-[210px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-300">
          <div className="mb-2 text-5xl">-</div>
          <p className="text-sm font-semibold">{t('bedroom.bed')} {bed.id}</p>
          <p className="text-base font-bold">{t('bedroom.bedNoInfo')}</p>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onAssignClick?.(bed)}
        className="flex min-h-[210px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
      >
        <div className="mb-2 text-5xl">+</div>
        <p className="text-sm font-semibold">{t('bedroom.bed')} {bed.id}</p>
        <p className="text-base font-bold">{t('bedroom.assignPatient')}</p>
      </button>
    );
  }

  return (
    <div className="min-h-[210px] rounded-3xl border-2 border-blue-600 bg-white p-5 shadow-sm cusror-pointer"
      onClick={()=> onBedClick?.(bed)}>
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-bold text-blue-700">{t('bedroom.bed')} {bed.id}</p>
        <span
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
            bed.status === "정상" || bed.status === "안정"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {bed.status}
        </span>
      </div>

      <div className="mb-5">
        <h3 className="text-3xl font-bold text-slate-900">{bed.patientName}</h3>
        <p className="mt-1 text-base text-slate-500">
          {genderLabel} / {bed.age ?? "-"}{t('transfer.ageUnit')}
        </p>
      </div>

      {bed.bloodType && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-400">{t('bedroom.bloodType')}</p>
            <p className="text-xl font-bold text-blue-700">{bed.bloodType}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-400">{t('bedroom.admissionDate')}</p>
            <p className="text-xl font-bold text-blue-700">{bed.admissionDate}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-400">{t('bedroom.birthDate')}</p>
            <p className="text-xl font-bold text-blue-700">{bed.birthDate}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BedCard;
