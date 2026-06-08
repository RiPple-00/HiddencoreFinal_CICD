import {
  bloodTypeLabel,
  displayPatientRef,
  formatBirthDot,
  resolvePatientAvatarUrl,
} from '../../utils/adminPatientUtils';
import { useI18n } from '../../hooks/useI18n';

export default function PatientProfileCard({ patient }) {
  const { t } = useI18n();

  if (!patient) return null;
  const refId = displayPatientRef(patient.patientId, patient.admissionDate);

  const genderLabel = (() => {
    if (patient.gender === 'MALE') return t('patient.gender.maleFull');
    if (patient.gender === 'FEMALE') return t('patient.gender.femaleFull');
    if (patient.gender === 'OTHER') return t('patient.gender.other');
    return patient.gender || '-';
  })();

  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 gap-5">
          <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#dbe4ff] to-[#c7d7ff]">
            <img
              src={resolvePatientAvatarUrl(patient)}
              alt={`${patient.name || t('patient.profile.inpatient')} 프로필`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">{patient.name}</h1>
            <p className="mt-1 text-sm font-semibold text-[#2d5bff]">ID: {refId}</p>

            <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-400">{t('patient.profile.genderAge')}</p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {genderLabel} / {patient.age != null ? `${patient.age}${t('patient.profile.ageUnit')}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">{t('patient.profile.bloodType')}</p>
                <p className="mt-0.5 font-bold text-[#e53e3e]">{bloodTypeLabel(patient.bloodType)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">{t('patient.profile.birthDate')}</p>
                <p className="mt-0.5 font-semibold text-slate-800">{formatBirthDot(patient.birthDate)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs font-medium text-slate-400">{t('patient.profile.address')}</p>
                <p className="mt-0.5 font-medium leading-snug text-slate-700">
                  {patient.address || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-[#e8f0ff] px-4 py-2 text-sm font-semibold text-[#2d5bff]">
          {t('patient.profile.inpatient')}
        </span>
      </div>
    </section>
  );
}
