import { useNavigate } from "react-router-dom";
import { genderCodeToLabel } from "../../utils/genderDisplay";

function PatientSummaryCard({ patient }) {
  const navigate = useNavigate();

  if (!patient) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">환자를 선택해주세요.</p>
      </section>
    );
  }

  const detailPatientId = patient.patientId ?? patient.id;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">선택 환자 요약 정보</h2>
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
          전체 환자 정보 보기
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-2xl bg-slate-200" />
          <div>
            <h3 className="text-4xl font-bold text-slate-900">{patient.name}</h3>
            <p className="mt-1 text-lg text-slate-500">환자 ID: {patient.id ?? patient.patientId}</p>

            <div className="mt-3 flex gap-2">
              <span className="rounded-lg bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                {genderCodeToLabel(patient.gender)}
              </span>
              <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {patient.age}세
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-base">
          <div>
            <p className="text-slate-400">주치의</p>
            <p className="font-bold text-slate-900">{patient.doctor}</p>
          </div>
          <div>
            <p className="text-slate-400">키</p>
            <p className="font-bold text-slate-900">{patient.height}</p>
          </div>
          <div>
            <p className="text-slate-400">정기 체크</p>
            <p className="font-bold text-slate-900">{patient.checkup}</p>
          </div>
        </div>

        <div className="space-y-3 text-base">
          <div>
            <p className="text-slate-400">입원일</p>
            <p className="font-bold text-slate-900">{patient.admissionDate}</p>
          </div>
          <div>
            <p className="text-slate-400">몸무게</p>
            <p className="font-bold text-slate-900">{patient.weight}</p>
          </div>
          <div>
            <p className="text-slate-400">코멘트</p>
            <p className="font-bold text-emerald-700">{patient.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PatientSummaryCard;
