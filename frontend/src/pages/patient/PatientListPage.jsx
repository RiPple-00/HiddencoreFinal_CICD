import { useEffect, useMemo, useState } from "react"; //useMemo: 계산결과 기억하기

import PatientTable from "../../components/patient/PatientTable";
import TopNavBar from "../../components/bedroom/TopNavBar";
import GuardianPanel from "../../components/bedroom/GuardianPanel";
import AdminMenuPanel from "../../components/bedroom/AdminMenuPanel";
//import VisitorsPanel from "../../components/bedroom/VisitorsPanel";
import MealCarePage from "../MealCarePage";
import PatientCreateModal from "../../components/patient/PatientCreateModal";
import bedRoomApi from "../../api/bedRoomApi";
import { useNavigate } from "react-router-dom";
import patientApi from "../../api/patientApi";
import { getRoomSummary, getAllBeds } from '../../api/LocationApi';
import { useAuth } from '../../contexts/AutoContext.jsx';

export default function PatientListPage() {
  const [patients, setPatients] = useState([]);

  const [keyword, setKeyword] = useState(""); //검색 할떄 쓰는거
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(""); //그 상태 필터
  const [quickFilter, setQuickFilter] = useState(""); // 미배정만 쓸때

  const [beds, setBeds] = useState([]); //병상 배정 방식에서 병상 선택하려고 불러오는 병상 목록 (일단 303호 기준으로 불러옴)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { user } = useAuth();
  const token = user?.accessToken ?? user?.token;
  const jwtPayload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const facilityId = jwtPayload.facilityId ?? null;

  useEffect(() => {
    fetchPatients(); // 환자 목록 불러오기
    if (facilityId) fetchBedsForCreateModal();// 병상 배정 방식에서 사용할 병상 데이터 불러오기
  }, [facilityId]);

  const fetchPatients = async () => {
    try {
      const response = await patientApi.getPatients();

      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      console.error(e)
      setPatients([]);
    }
  };

  const summary = useMemo(() => {
    const patientList = Array.isArray(patients) ? patients : [];

    return {
      admittedCount: patientList.length,

      dischargeSoonCount: patientList.filter(
        (patient) => patient.patientStatus === "DISCHARGE",
      ).length,

      unassignedCount: patientList.filter(
        (patient) => !patient.building || !patient.room,
      ).length,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {// 검색/필터를 적용한 뒤 최신 등록 환자가 위로 오도록 patientId 내림차순 정렬
    // (현재 구조에서는 patientId가 클수록 최신 환자로 가정) 우리 이름 규칙 어딨었는지 기억 안나
    const lowerKeyword = keyword.toLowerCase();

    return (Array.isArray(patients) ? patients : []).filter((patient) => {
      const matchesKeyword =
        patient.name?.toLowerCase().includes(lowerKeyword) ||
        String(patient.patientId).includes(lowerKeyword);

      const matchesStatus =
        statusFilter === "" || patient.patientStatus === statusFilter;

      const matchesQuickFilter =
        quickFilter === "" ||
        (quickFilter === "UNASSIGNED" && (!patient.building || !patient.room));

      return matchesKeyword && matchesStatus && matchesQuickFilter;
    }).sort((a, b) => b.patientId - a.patientId); // 최신 환자 먼저
  }, [patients, keyword, statusFilter, quickFilter]);

  const handleGoCreatePage = () => {
    setIsCreateModalOpen(true);
  };

  // 일단 layout 모달용으로 303호 병상 배치도를 불러옴
  // 나중에 room 선택 방식으로 바꾸면 이 부분 수정하면 됨
  const fetchBedsForCreateModal = async () => {
    try {
      const data = await getAllBeds(facilityId);
      const mappedBeds = data.map((bed) => ({
        locationId: bed.locationId,
        id: bed.bed,
        room: bed.room,
        building: bed.building,
        floor: bed.floor,
        roomType: bed.roomType,
        occupied: bed.occupied,
        roomCapacity: bed.roomCapacity,
        patientId: bed.patientId,
        patientName: bed.name,
        gender: bed.gender,
        age: bed.age,
        status: bed.status,
        bloodType: bed.type,
        admissionDate: bed.admissionDate,
        birthDate: bed.birthDate,
      }));

      setBeds(mappedBeds);
    } catch (error) {
      console.error("병상 목록 조회 실패", error);
      setBeds([]);
    }
  };

  return (
    <>
      <TopNavBar activeNav="patients" />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1680px] items-start gap-8 px-8 py-6">
          <main className="min-w-0 flex-1">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              {/* 맨위 제목이랑 환자등록 버튼 */}
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">환자 조회</h1>
                <button
                  onClick={handleGoCreatePage}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  신규 환자 등록
                </button>
              </div>

              {/* 환자 수 카드 세개 */}
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
                  <p className="text-sm font-medium text-slate-500">
                    현재 입원 환자
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {summary.admittedCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
                  <p className="text-sm font-medium text-slate-500">
                    금일 퇴원 예정
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {summary.dischargeSoonCount}
                  </p>
                </div>

                <div
                  onClick={() =>
                    setQuickFilter((prev) =>
                      prev === "UNASSIGNED" ? "" : "UNASSIGNED",
                    )
                  }
                  className={`cursor-pointer rounded-2xl border px-6 py-5 ${quickFilter === "UNASSIGNED"
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50"
                    }`}
                >
                  <p className="text-sm font-medium text-slate-500">
                    병실 미배정 환자
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {summary.unassignedCount}
                  </p>
                </div>
              </div>

              {/* 검색창, 드롭다운 상태 체크 */}
              <div className="mb-6 flex gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="환자 이름, ID 검색"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-48 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">전체 상태</option>
                  <option value="STABLE">안정</option>
                  <option value="MONITORING">집중관찰</option>
                  <option value="DISCHARGE">퇴원예정</option>
                  <option value="POSTOPERATIVE">수술후</option>
                  <option value="CRITICAL">위험</option>
                  <option value="DISCHARGED">퇴원완료</option>
                </select>
              </div>

              <div className="mt-6">
                <PatientTable
                  patients={filteredPatients}
                  onRowClick={(patient) =>
                    navigate(`/patients/${patient.patientId}`)
                  }
                />
              </div>
            </div>
          </main>

          <PatientCreateModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={fetchPatients}
            beds={beds}
          />
          <aside className="w-[360px] shrink-0 space-y-6 self-start lg:sticky lg:top-6">
            <GuardianPanel />
            <AdminMenuPanel />
            <VisitorsPanel />
            <MealCarePage />
          </aside>
        </div>
      </div>
    </>
  );
}
