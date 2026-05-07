import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavBar from '../../components/bedroom/TopNavBar';
import patientApi from '../../api/patientApi';
import mealApi from '../../api/mealApi';
import { useAuth } from '../../contexts/AutoContext.jsx';
import PatientProfileCard from '../../components/adminPatient/PatientProfileCard';
import AdmissionInfoCard from '../../components/adminPatient/AdmissionInfoCard';
import DiagnosisCard from '../../components/adminPatient/DiagnosisCard';
import PaymentInsuranceCard from '../../components/adminPatient/PaymentInsuranceCard';
import GuardianAlertCard from '../../components/adminPatient/GuardianAlertCard';
import GuardianVisitCard from '../../components/adminPatient/GuardianVisitCard';
import AdminQuickMenu from '../../components/adminPatient/AdminQuickMenu';
import MealPreviewCard from '../../components/adminPatient/MealPreviewCard';

const navItemsBase = [
  { key: 'rooms', label: '병실 조회', to: '/ward' },
  { key: 'patients', label: '환자 조회', to: '/patients' },
  { key: 'calendar', label: '캘린더', to: '/schedule' },
  { key: 'notice', label: '공지사항', to: null },
];

export default function AdminPatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extras, setExtras] = useState({ guardians: [], visitRequests: [], payments: [] });
  const [meals, setMeals] = useState([]);

  const facilityId = useMemo(() => {
    const token = user?.accessToken ?? user?.token;
    if (!token || typeof token !== 'string') return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.facilityId ?? null;
    } catch {
      return null;
    }
  }, [user]);

  const navItems = useMemo(
    () =>
      navItemsBase.map((item) =>
        item.key === 'notice' && facilityId
          ? { ...item, to: `/facilities/${facilityId}/board` }
          : item,
      ),
    [facilityId],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [patientRes, extrasRes] = await Promise.all([
          patientApi.getPatientById(patientId),
          patientApi.getPatientExtras(patientId),
        ]);
        if (cancelled) return;
        setPatient(patientRes.data ?? null);
        setExtras(extrasRes.data ?? { guardians: [], visitRequests: [], payments: [] });
      } catch (e) {
        if (!cancelled) {
          setPatient(null);
          setExtras({ guardians: [], visitRequests: [], payments: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!facilityId) {
        setMeals([]);
        return;
      }
      const date = new Date().toISOString().slice(0, 10);
      try {
        const res = await mealApi.getMealsByDate(date, facilityId);
        if (!cancelled) setMeals(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setMeals([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}>
      <TopNavBar
        activeNav="patients"
        navItems={navItems}
        userName="김관리자 (Admin Kim)"
        userRole="SUPERUSER"
        searchPlaceholder="환자 검색..."
      />

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-5 py-6">
        <main className="min-w-0 flex-1 space-y-5">
          {loading ? (
            <div className="rounded-2xl border border-[#e8eaef] bg-white p-10 text-center text-slate-500 shadow-sm">
              환자 정보를 불러오는 중…
            </div>
          ) : !patient ? (
            <div className="rounded-2xl border border-[#e8eaef] bg-white p-10 text-center shadow-sm">
              <p className="text-slate-600">해당 환자를 찾을 수 없습니다.</p>
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="mt-4 rounded-xl bg-[#2d5bff] px-5 py-2.5 text-sm font-bold text-white"
              >
                목록으로
              </button>
            </div>
          ) : (
            <>
              <PatientProfileCard patient={patient} />
              <div className="grid gap-5 md:grid-cols-2">
                <AdmissionInfoCard patient={patient} />
                <DiagnosisCard patient={patient} />
              </div>
              <PaymentInsuranceCard payments={extras.payments} />
              <GuardianVisitCard guardians={extras.guardians} visitRequests={extras.visitRequests} />
            </>
          )}
        </main>

        <aside className="hidden w-[320px] shrink-0 space-y-5 lg:block">
          <GuardianAlertCard patient={patient} />
          <AdminQuickMenu />
          <MealPreviewCard patient={patient} meals={meals} />
          <div className="flex items-center justify-between rounded-2xl bg-[#2d5bff] px-4 py-3 text-white shadow-md">
            <span className="text-sm font-bold">실시간 면회 현황</span>
            <span className="rounded-full bg-[#e53e3e] px-2.5 py-0.5 text-xs font-bold text-white">3 New</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

