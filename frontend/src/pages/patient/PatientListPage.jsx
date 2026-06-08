import { useEffect, useMemo, useState } from "react";

import PatientTable from "../../components/patient/PatientTable";
import Header from "../../components/common/Header";
import GuardianPanel from "../../components/bedroom/GuardianPanel";
import AdminMenuPanel from "../../components/bedroom/AdminMenuPanel";
import MealCarePage from "../MealCarePage";
import PatientCreateModal from "../../components/patient/PatientCreateModal";
import bedRoomApi from "../../api/bedRoomApi";
import { useNavigate, useLocation } from "react-router-dom";
import patientApi from "../../api/patientApi";
import { getRoomSummary, getAllBeds } from '../../api/LocationApi';
import { useAuth } from '../../contexts/AutoContext.jsx';
import { useI18n } from "../../hooks/useI18n";

export default function PatientListPage() {
  const { t } = useI18n();
  const [patients, setPatients] = useState([]);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState("");
  const [beds, setBeds] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { user } = useAuth();
  const token = user?.accessToken ?? user?.token;
  let facilityId = null;
  if (token && typeof token === "string") {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      facilityId = payload?.facilityId ?? null;
    } catch {
      facilityId = null;
    }
  }

  useEffect(() => {
    fetchPatients();
    if (facilityId) fetchBedsForCreateModal();
  }, [facilityId]);

  useEffect(() => {
    if (location.state?.openPatientCreate) {
      setIsCreateModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const fetchPatients = async () => {
    try {
      const response = await patientApi.getPatients();
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      console.error(e);
      setPatients([]);
    }
  };

  const summary = useMemo(() => {
    const patientList = Array.isArray(patients) ? patients : [];
    return {
      admittedCount: patientList.length,
      dischargeSoonCount: patientList.filter((p) => p.patientStatus === "DISCHARGE").length,
      unassignedCount: patientList.filter((p) => !p.building || !p.room).length,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const lowerKeyword = keyword.toLowerCase();
    return (Array.isArray(patients) ? patients : [])
      .filter((patient) => {
        const matchesKeyword =
          patient.name?.toLowerCase().includes(lowerKeyword) ||
          String(patient.patientId).includes(lowerKeyword);
        const matchesStatus = statusFilter === "" || patient.patientStatus === statusFilter;
        const matchesQuickFilter =
          quickFilter === "" ||
          (quickFilter === "UNASSIGNED" && (!patient.building || !patient.room));
        return matchesKeyword && matchesStatus && matchesQuickFilter;
      })
      .sort((a, b) => b.patientId - a.patientId);
  }, [patients, keyword, statusFilter, quickFilter]);

  const handleGoCreatePage = () => setIsCreateModalOpen(true);

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

  const statusOptions = [
    { value: "STABLE", labelKey: "patient.status.stable" },
    { value: "MONITORING", labelKey: "patient.status.monitoring" },
    { value: "DISCHARGE", labelKey: "patient.status.discharge" },
    { value: "POSTOPERATIVE", labelKey: "patient.status.postoperative" },
    { value: "CRITICAL", labelKey: "patient.status.critical" },
    { value: "DISCHARGED", labelKey: "patient.status.discharged" },
  ];

  return (
    <>
      <Header activeNav="patients" />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1680px] items-start gap-8 px-8 py-6">
          <main className="min-w-0 flex-1">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">{t('patientList.title')}</h1>
                <button
                  onClick={handleGoCreatePage}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t('patientList.newPatient')}
                </button>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
                  <p className="text-sm font-medium text-slate-500">{t('patientList.currentInpatients')}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{summary.admittedCount}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
                  <p className="text-sm font-medium text-slate-500">{t('patientList.todayDischarge')}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{summary.dischargeSoonCount}</p>
                </div>

                <div
                  onClick={() => setQuickFilter((prev) => (prev === "UNASSIGNED" ? "" : "UNASSIGNED"))}
                  className={`cursor-pointer rounded-2xl border px-6 py-5 ${
                    quickFilter === "UNASSIGNED" ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-500">{t('patientList.unassignedRooms')}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{summary.unassignedCount}</p>
                </div>
              </div>

              <div className="mb-6 flex gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t('patientList.searchPlaceholder')}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-48 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">{t('patientList.allStatus')}</option>
                  {statusOptions.map(({ value, labelKey }) => (
                    <option key={value} value={value}>{t(labelKey)}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <PatientTable
                  patients={filteredPatients}
                  onRowClick={(patient) => navigate(`/patients/${patient.patientId}`)}
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
            <MealCarePage />
          </aside>
        </div>
      </div>
    </>
  );
}
