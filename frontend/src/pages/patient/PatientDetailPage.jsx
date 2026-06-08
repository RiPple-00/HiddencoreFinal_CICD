import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import patientApi from "../../api/patientApi";
import SectionCard from "../../components/patient/SectionCard";
import Header from "../../components/common/Header";
import { useI18n } from "../../hooks/useI18n";

const getStatusClassName = (status) => {
  switch (status) {
    case "STABLE": return "bg-green-100 text-green-700";
    case "MONITORING": return "bg-orange-100 text-orange-700";
    case "DISCHARGE": return "bg-blue-100 text-blue-700";
    case "POSTOPERATIVE": return "bg-purple-100 text-purple-700";
    case "CRITICAL": return "bg-red-100 text-red-600";
    case "DISCHARGED": return "bg-slate-200 text-slate-700";
    default: return "bg-slate-100 text-slate-500";
  }
};

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="min-w-[64px] text-slate-400">{label}</span>
      <span className="text-slate-700">{value || "-"}</span>
    </div>
  );
}

export default function PatientDetailPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { t } = useI18n();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await patientApi.getPatientById(patientId);
        setPatient(response.data);
      } catch (error) {
        console.error("환자 상세 조회 실패", error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  const getGenderLabel = (g) => {
    if (g === "MALE") return t('patient.gender.male');
    if (g === "FEMALE") return t('patient.gender.female');
    if (g === "OTHER") return t('patient.gender.other');
    return g || "-";
  };

  const getStatusLabel = (status) => t(`patient.status.${(status || '').toLowerCase()}`, '-');

  if (loading) {
    return (
      <>
        <Header activeNav="patients" />
        <div className="min-h-screen bg-slate-50 px-6 py-6">
          <div className="mx-auto max-w-[960px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-slate-900">{t('patientDetail.title')}</h1>
            <p className="text-slate-500">{t('patientDetail.loading')}</p>
          </div>
        </div>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Header activeNav="patients" />
        <div className="min-h-screen bg-slate-50 px-6 py-6">
          <div className="mx-auto max-w-[960px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-slate-900">{t('patientDetail.title')}</h1>
            <p className="mb-6 text-slate-500">{t('patientDetail.notFound')}</p>
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white"
            >
              {t('patientDetail.backToList')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header activeNav="patients" />
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-[960px] space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-200">
                  <img
                    src="https://via.placeholder.com/100x100.png?text=Patient"
                    alt="patient"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                  </div>

                  <div className="mb-3 text-xs font-semibold text-blue-600">
                    ID: {patient.patientId}
                  </div>

                  <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
                    <InfoRow
                      label={t('patientDetail.genderAge')}
                      value={`${getGenderLabel(patient.gender)} / ${patient.age}${t('patientDetail.ageUnit')}`}
                    />
                    <InfoRow label={t('patientDetail.birthDate')} value={patient.birthDate} />
                    <InfoRow label={t('patientDetail.bloodType')} value={patient.bloodType} />
                    <InfoRow
                      label={t('patientDetail.statusLabel')}
                      value={
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(patient.patientStatus)}`}
                        >
                          {getStatusLabel(patient.patientStatus)}
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>

              <button className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                {t('patientDetail.edit')}
              </button>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <SectionCard title={t('patientDetail.admissionInfo')} icon="🏥">
              <div className="space-y-2 text-sm">
                <InfoRow label={t('patientDetail.admissionDate')} value={patient.admissionDate} />
                <InfoRow label={t('patientDetail.dischargeDate')} value={patient.dischargeDate} />
                <InfoRow
                  label={t('patientDetail.room')}
                  value={
                    patient.building || patient.room
                      ? `${patient.building || "-"} / ${patient.room || "-"}`
                      : "-"
                  }
                />
                <InfoRow label={t('patientDetail.diet')} value={patient.dietType} />
              </div>
            </SectionCard>

            <SectionCard title={t('patientDetail.memo')} icon="📝">
              <div className="text-sm text-slate-700 whitespace-pre-line">
                {patient.memo || "-"}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
