import { useNavigate } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";

function PatientSummaryCard({ patient }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  if (!patient) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">{t('patient.profile.noSelection')}</p>
      </section>
    );
  }

  const detailPatientId = patient.patientId ?? patient.id;

  const genderLabel = (() => {
    if (patient.gender === 'MALE') return t('patient.gender.maleFull');
    if (patient.gender === 'FEMALE') return t('patient.gender.femaleFull');
    if (patient.gender === 'OTHER') return t('patient.gender.other');
    return patient.gender || '-';
  })();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{t('patient.profile.summaryTitle')}</h2>
        <button
          type="button"
          disabled={detailPatientId == null || detailPatientId === ""}
          onClick={() => {
            if (detailPatientId != null && detailPatientId !== "") {
              navigate(`/patients/${detailPatientId}`);
            }
          }}
          className="text-sm font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('patient.profile.viewAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-2xl bg-slate-200" />
          <div>
            <h3 className="text-4xl font-bold text-slate-900">{patient.name}</h3>
            <p className="mt-1 text-lg text-slate-500">{t('patient.profile.patientIdLabel')} {patient.id ?? patient.patientId}</p>

            <div className="mt-3 flex gap-2">
              <span className="rounded-lg bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                {genderLabel}
              </span>
              <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {patient.age}{t('patient.profile.ageUnit')}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-base">
          <div>
            <p className="text-slate-400">{t('patient.profile.doctor')}</p>
            <p className="font-bold text-slate-900">{patient.doctor}</p>
          </div>
          <div>
            <p className="text-slate-400">{t('patient.profile.height')}</p>
            <p className="font-bold text-slate-900">{patient.height}</p>
          </div>
          <div>
            <p className="text-slate-400">{t('patient.profile.regularCheck')}</p>
            <p className="font-bold text-slate-900">{patient.checkup}</p>
          </div>
        </div>

        <div className="space-y-3 text-base">
          <div>
            <p className="text-slate-400">{t('patient.profile.admissionDate')}</p>
            <p className="font-bold text-slate-900">{patient.admissionDate}</p>
          </div>
          <div>
            <p className="text-slate-400">{t('patient.profile.weight')}</p>
            <p className="font-bold text-slate-900">{patient.weight}</p>
          </div>
          <div>
            <p className="text-slate-400">{t('patient.profile.comment')}</p>
            <p className="font-bold text-emerald-700">{patient.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PatientSummaryCard;
