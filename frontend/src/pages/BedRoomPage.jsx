import Header from "../components/common/Header";
import RoomLayoutCard from "../components/bedroom/RoomLayoutCard";
import PatientSummaryCard from "../components/bedroom/PatientSummaryCard";
import TransferRequestCard from "../components/bedroom/TransferRequestCard";
import GuardianPanel from "../components/bedroom/GuardianPanel";
import AdminMenuPanel from "../components/bedroom/AdminMenuPanel";
import VisitorsPanel from "../components/bedroom/VisitorsPanel";
import MealCarePage from "./MealCarePage";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import bedRoomApi from "../api/bedRoomApi";
import patientApi from "../api/patientApi";
import { useParams, useSearchParams } from "react-router-dom";

const mapDetailToSummaryPatient = (d) => {
  if (!d) return null;
  const g = d.gender;
  let genderLabel = "-";
  if (g === "MALE") genderLabel = "남";
  else if (g === "FEMALE") genderLabel = "여";
  else if (g === "OTHER") genderLabel = "기타";
  else if (g != null) genderLabel = String(g);

  return {
    patientId: d.patientId,
    id: String(d.patientId),
    name: d.name ?? "-",
    gender: genderLabel,
    age: d.age ?? "-",
    doctor: "-",
    checkup: "-",
    admissionDate: d.admissionDate ?? "-",
    height: "-",
    weight: "-",
    description: d.memo ?? "-",
  };
};

function BedRoomPage() {
  const { room } = useParams();
  const [searchParams] = useSearchParams();
  const building = searchParams.get("building")?.trim() || undefined;

  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomCapacity, setRoomCapacity] = useState(null);
  const [error, setError] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetailLoading, setPatientDetailLoading] = useState(false);
  const [patientDetailError, setPatientDetailError] = useState("");

  const [patientSearch, setPatientSearch] = useState("");

  const [searchedPatients, setSearchedPatients] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [searchAttempted, setSearchAttempted] = useState(false);
  const [assigningPatientId, setAssigningPatientId] = useState(null);

  const loadBeds = useCallback(async () => {
    if (!room) return;
    try {
      setLoading(true);
      setError("");

      const res = await bedRoomApi.getBedsByRoom(room, building);

      const data = res?.data ?? [];
      const mappedBeds = data.map((bed) => ({
        locationId: bed.locationId,
        patientId: bed.patientId,
        id: bed.bedId,
        patientName: bed.name,
        gender: bed.gender,
        age: bed.age,
        status: bed.status,
        occupied: bed.occupied,
        bloodType: bed.type,
        admissionDate: bed.admissionDate,
        roomCapacity: bed.roomCapacity,
        birthDate: bed.birthDate,
      }));

      setBeds(mappedBeds);

      if (data.length > 0) {
        setRoomCapacity(data[0].roomCapacity);
      } else {
        setRoomCapacity(null);
      }
    } catch (e) {
      console.error("병상 조회 실패", e);

      if (e.code === "ERR_NETWORK") {
        setError(
          "백엔드 서버에 연결할 수 없습니다. 서버 실행 상태와 포트를 확인해주세요.",
        );
      } else {
        setError("병상 조회 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [room, building]);

  useEffect(() => {
    loadBeds();
  }, [loadBeds]);

  const handlePatientSearch = async () => {
    const keyword = patientSearch.trim();
    if (!keyword) {
      setSearchedPatients([]);
      setSearchError("환자 이름을 입력해주세요.");
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");
      setSearchAttempted(true);
      const res = await bedRoomApi.getSearchPatientsForAssign(keyword);
      setSearchedPatients(res?.data ?? []);
    } catch (e) {
      console.error("환자 검색 실패", e);
      setSearchError("환자 검색 중 오류가 발생했습니다.");
      setSearchedPatients([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 환자 배정 모달 열기
  const openAssignModal = (bed) => {
    setSelectedBed(bed);
    setPatientSearch("");
    setSearchedPatients([]);
    setSearchError("");
    setSearchAttempted(false);
    setIsAssignModalOpen(true);
  };

  // 환자 배정 모달 닫기 및 상태 초기화
  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedBed(null);
    setPatientSearch("");
    setSearchedPatients([]);
    setSearchError("");
    setSearchAttempted(false);
    setAssigningPatientId(null);
  };

  const handleAssignPatientToSelectedBed = async (patient) => {
    if (!selectedBed?.locationId || !patient?.assignable) return;
    try {
      setAssigningPatientId(patient.patientId);
      const res = await bedRoomApi.assignPatientToBed(
        selectedBed.locationId,
        patient.patientId,
      );
      if (res?.data?.ok === false) {
        toast.error("배정할 수 없습니다. (이미 배정됨/병상 사용중/성별 불일치)");
        return;
      }
      toast.success("환자를 침상에 배정했습니다.");
      closeAssignModal();
      await loadBeds();
    } catch (e) {
      console.error("환자 배정 실패", e);
    } finally {
      setAssigningPatientId(null);
    }
  };

  //-------------------------------------------------------------------------

  const handleBedClick = async (bed) => {
    setSelectedBed(bed);
    setSelectedPatient(null);
    setPatientDetailError("");

    if (!bed?.patientId) {
      setPatientDetailError("선택한 침상에 배정된 환자가 없습니다.");
      return;
    }

    try {
      setPatientDetailLoading(true);
      const res = await patientApi.getPatientById(bed.patientId);
      setSelectedPatient(mapDetailToSummaryPatient(res?.data));
    } catch (e) {
      console.error("환자 상세 조회", e);
      setPatientDetailError("환자 상세 정보를 불러오지 못했습니다.");
    } finally {
      setPatientDetailLoading(false);
    }
  };

  const closeBedModal = () => {
    setSelectedBed(null);
    setSelectedPatient(null);
    setPatientDetailLoading(false);
    setPatientDetailError("");
  };



  const [unassigning, setUnassigning] = useState(false);
  const handleUnassignSelectedBed = async () => {
    if (!selectedBed?.locationId) return;
    try {
      setUnassigning(true);
      await bedRoomApi.deletePatientFromBed(selectedBed.locationId);
      toast.success("병상 배치를 취소했습니다.");
      closeBedModal();
      await loadBeds();
    } catch (e) {
      console.error("병상 배치 취소 실패", e);
    } finally {
      setUnassigning(false);
    }
  };


  /*const transfers = [
    {
      id: 1,
      name: "한예슬",
      age: 35,
      desc: "BED E 배정 대기 중 (502호 이동 요청)",
      type: "normal",
    },
    {
      id: 2,
      name: "김태진",
      age: 68,
      desc: "BED A → 중환자실(ICU) 이동 대기 (상태 악화)",
      type: "urgent",
    },
  ];

  */
  return (
    <>
      <Header activeNav="rooms" />
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-[1440px] gap-6 px-6 py-6">
          <main className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-slate-900">{room}호</h1>
              {roomCapacity && (
                <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                  {roomCapacity}인실
                </span>
              )}
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                로딩 중...
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm text-red-600">
                {error}
              </div>
            ) : (
              <RoomLayoutCard
                beds={beds}
                onAssignClick={openAssignModal}
                onBedClick={handleBedClick}
              />
            )}

            {/* <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                환자 병실 이동(전실) 관리
              </h2>
              <span className="text-sm text-slate-400">2023년 10월 24일</span>
            </div>

            <div className="space-y-4">
              {transfers.map((item) => (
                <TransferRequestCard key={item.id} item={item} />
              ))}
            </div>
          </section> */}
          </main>

          <aside className="w-[320px] space-y-6">
            <GuardianPanel />
            <AdminMenuPanel />
            <VisitorsPanel />
            <MealCarePage />
          </aside>
        </div>
      </div>

      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-[760px] rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  환자 검색 및 배정
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  병동 관리 및 환자 담당의 배정 시스템
                </p>
              </div>
              <button
                type="button"
                onClick={closeAssignModal}
                className="rounded-xl p-2 text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="팝업 닫기"
              >
                ×
              </button>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePatientSearch();
                  }
                }}
                placeholder="환자 이름을 입력하세요"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handlePatientSearch}
                disabled={searchLoading}
                className="h-12 rounded-xl bg-blue-500 px-7 text-base font-semibold text-white transition hover:bg-blue-600"
              >
                {searchLoading ? "검색중..." : "검색"}
              </button>
            </div>

            <p className="mb-3 text-sm text-slate-500">
              검색 결과 ({searchedPatients.length})
            </p>
            {searchError && (
              <p className="mb-3 text-sm text-red-500">{searchError}</p>
            )}

            <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1">
              {searchedPatients.map((patient) => {
                const isFemale =
                  typeof patient.gender === "string" &&
                  patient.gender.includes("여");
                const iconClass = patient.assignable
                  ? isFemale
                    ? "bg-pink-100 text-pink-600"
                    : "bg-blue-100 text-blue-600"
                  : "bg-slate-200 text-slate-500";

                return (
                  <div
                    key={patient.patientId}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
                      patient.assignable
                        ? "border-slate-200 bg-white"
                        : "border-dashed border-slate-200 bg-slate-50 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg ${iconClass}`}
                      >
                        👤
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-2xl font-bold text-slate-900">
                            {patient.name}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              patient.assignmentStatus === "미배정"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {patient.assignmentStatus === "미배정"
                              ? "미배정"
                              : "배정됨"}
                          </span>
                          {patient.assignedBedLabel && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                              {patient.assignedBedLabel}
                            </span>
                          )}
                          <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">
                            {patient.condition || "-"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {patient.gender || "-"} / {patient.age ?? "-"}세
                          {patient.chartId ? ` · 차트 ${patient.chartId}` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        !patient.assignable ||
                        assigningPatientId === patient.patientId
                      }
                      onClick={() => handleAssignPatientToSelectedBed(patient)}
                      className={`rounded-xl px-5 py-2 text-base font-semibold ${
                        patient.assignable
                          ? "bg-blue-500 text-white transition hover:bg-blue-600 disabled:opacity-60"
                          : "cursor-not-allowed bg-slate-200 text-slate-400"
                      }`}
                    >
                      {patient.assignable
                        ? assigningPatientId === patient.patientId
                          ? "처리 중..."
                          : "배정하기"
                        : "배정완료"}
                    </button>
                  </div>
                );
              })}
              {!searchLoading &&
                searchAttempted &&
                searchedPatients.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-400">
                    검색된 환자가 없습니다.
                  </div>
                )}
              {!searchLoading && !searchAttempted && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-400">
                  환자 이름을 입력한 뒤 검색을 눌러주세요.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeAssignModal}
                className="rounded-xl px-6 py-2 text-base font-semibold text-slate-500 transition hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={closeAssignModal}
                className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                닫기
              </button>
            </div>

            {selectedBed && (
              <p className="mt-3 text-sm text-slate-400">
                현재 선택 침상: {selectedBed.id}
              </p>
            )}
          </div>
        </div>
      )}

      {/* PatientSummaryCard 컴포넌트 관련 */}
      {selectedBed?.occupied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-[860px] rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-2 flex justify-end">
              <button
                onClick={closeBedModal}
                className="rounded-xl p-2 text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="팝업 닫기"
              >
                ×
              </button>
            </div>

            {patientDetailLoading ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-slate-500">
                로딩 중...
              </div>
            ) : patientDetailError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
                {patientDetailError}
              </div>
            ) : (
              <PatientSummaryCard patient={selectedPatient} />
            )}
            <br />
            <button
              type="button"
              disabled={unassigning}
              onClick={handleUnassignSelectedBed}
              className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600"
            >
              {unassigning ? "처리 중..." : "병상 배치 취소하기"}
            </button>


            <button className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
              환자 병실 이동(전실) 관리
            </button>


          </div>
        </div>
      )}
    </>
  );
}

export default BedRoomPage;
