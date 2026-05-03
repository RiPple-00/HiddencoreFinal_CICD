import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import patientApi from "../../api/patientApi";
import SectionCard from "../../components/patient/SectionCard";
import TopNavBar from "../../components/bedroom/TopNavBar";



/** Patient 도메인 PatientStatus 와 동일 */
const getStatusLabel = (status) => {
    switch (status) {
        case "STABLE":
            return "안정";
        case "MONITORING":
            return "집중관찰";
        case "DISCHARGE":
            return "퇴원예정";
        case "POSTOPERATIVE":
            return "수술후";
        case "CRITICAL":
            return "위험";
        case "DISCHARGED":
            return "퇴원완료";
        default:
            return "-";
    }
};

const getStatusClassName = (status) => {
    switch (status) {
        case "STABLE":
            return "bg-green-100 text-green-700";
        case "MONITORING":
            return "bg-orange-100 text-orange-700";
        case "DISCHARGE":
            return "bg-blue-100 text-blue-700";
        case "POSTOPERATIVE":
            return "bg-purple-100 text-purple-700";
        case "CRITICAL":
            return "bg-red-100 text-red-600";
        case "DISCHARGED":
            return "bg-slate-200 text-slate-700";
        default:
            return "bg-slate-100 text-slate-500";
    }
};

const genderLabel = (g) => {
    if (g == null) return "-";
    if (typeof g !== "string") return String(g);
    if (g === "MALE") return "남";
    if (g === "FEMALE") return "여";
    if (g === "OTHER") return "기타";
    return g;
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

    if (loading) {
        return (
            <>
                <TopNavBar activeNav="patients" />
                <div className="min-h-screen bg-slate-50 px-6 py-6">
                    <div className="mx-auto max-w-[960px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                        <h1 className="mb-4 text-2xl font-bold text-slate-900">환자 상세 정보</h1>
                        <p className="text-slate-500">불러오는 중...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!patient) {
        return (
            <>
                <TopNavBar activeNav="patients" />
                <div className="min-h-screen bg-slate-50 px-6 py-6">
                    <div className="mx-auto max-w-[960px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                        <h1 className="mb-4 text-2xl font-bold text-slate-900">환자 상세 정보</h1>
                        <p className="mb-6 text-slate-500">해당 환자를 찾을 수 없습니다.</p>
                        <button
                            type="button"
                            onClick={() => navigate("/patients")}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                        >
                            목록으로
                        </button>
                    </div>
                </div>
            </>
        );
    }
    return (
        <>
            <TopNavBar activeNav="patients" />
            <div className="min-h-screen bg-slate-50 px-6 py-6">
                <div className="mx-auto max-w-[960px] space-y-4">
            {/* 상단 프로필 카드 */}
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
                                <InfoRow label="성별/나이" value={`${genderLabel(patient.gender)} / ${patient.age}세`} />
                                <InfoRow label="생년월일" value={patient.birthDate} />
                                <InfoRow label="혈액형" value={patient.bloodType} />
                                <InfoRow
                                    label="상태"
                                    value={
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
                                                patient.patientStatus
                                            )}`}
                                        >
                                            {getStatusLabel(patient.patientStatus)}
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <button className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                        편집하기
                    </button>
                </div>
            </section>

            {/* 하단 카드들 */}
            <div className="grid grid-cols-2 gap-4">
                <SectionCard title="입원 정보" icon="🏥">
                    <div className="space-y-2 text-sm">
                        <InfoRow label="입원일" value={patient.admissionDate} />
                        <InfoRow label="퇴원일" value={patient.dischargeDate} />
                        <InfoRow
                            label="병실"
                            value={
                                patient.building || patient.room
                                    ? `${patient.building || "-"} / ${patient.room || "-"}`
                                    : "-"
                            }
                        />
                        <InfoRow label="식이" value={patient.dietType} />
                    </div>
                </SectionCard>

                <SectionCard title="메모" icon="📝">
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