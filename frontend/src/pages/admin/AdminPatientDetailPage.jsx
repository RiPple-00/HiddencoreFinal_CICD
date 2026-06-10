import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import patientApi from '../../api/patientApi';
import mealApi from '../../api/mealApi';
import { useAuth } from '../../contexts/AutoContext.jsx';
import PatientProfileCard from '../../components/adminPatient/PatientProfileCard';
import AdmissionInfoCard from '../../components/adminPatient/AdmissionInfoCard';
import DiagnosisCard from '../../components/adminPatient/DiagnosisCard';
import PaymentInsuranceCard from '../../components/adminPatient/PaymentInsuranceCard';
import GuardianAlertCard from '../../components/adminPatient/GuardianAlertCard';
import GuardianVisitCard from '../../components/adminPatient/GuardianVisitCard';
// import AdminQuickMenu from '../../components/adminPatient/AdminQuickMenu';
import MealPreviewCard from '../../components/adminPatient/MealPreviewCard';
import { useI18n } from '../../hooks/useI18n.jsx';

export default function AdminPatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extras, setExtras] = useState({ guardians: [], visitRequests: [], payments: [] });
  const [meals, setMeals] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


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

  const handleDeletePatient = async () => {
    if (!patientId) return;

    try {
      setIsDeleting(true);
      await patientApi.deletePatient(patientId);
      alert('입소자가 삭제되었습니다.');
      navigate('/patients', { replace: true });
    } catch (error) {
      console.error('입소자 삭제 실패', error);
      alert('입소자 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}>
      <Header
        activeNav="patients"
        userName="김관리자 (Admin Kim)"
        userRole="SUPERUSER"
        searchPlaceholder="입소자 검색..."
      />

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-5 py-6">
        <main className="min-w-0 flex-1 space-y-5">
          {loading ? (
            <div className="rounded-2xl border border-[#e8eaef] bg-white p-10 text-center text-slate-500 shadow-sm">
              입소자 정보를 불러오는 중…
            </div>
          ) : !patient ? (
            <div className="rounded-2xl border border-[#e8eaef] bg-white p-10 text-center shadow-sm">
              <p className="text-slate-600">해당 입소자를 찾을 수 없습니다.</p>
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
              <div className="relative">
                <PatientProfileCard patient={patient} />

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="absolute right-6 top-[72px] rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  입소자 삭제
                </button>
              </div>
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
          <MealPreviewCard patient={patient} meals={meals} />
          <div className="flex items-center justify-between rounded-2xl bg-[#2d5bff] px-4 py-3 text-white shadow-md">
            <span className="text-sm font-bold">{t('visitManagement.liveStatus', '실시간 면회 현황')}</span>
            <span className="rounded-full bg-[#e53e3e] px-2.5 py-0.5 text-xs font-bold text-white">
              {t('visitManagement.newBadge', '{count} New', { count: 3 })}
            </span>
          </div>
        </aside>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900">입소자 삭제</h3>

            <p className="mt-4 text-base leading-7 text-slate-600">
              정말 이 입소자를 삭제하시겠습니까?
              <br />
              삭제 후에는 입소자 목록에서 사라집니다.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                아니요
              </button>

              <button
                type="button"
                onClick={handleDeletePatient}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? '삭제 중...' : '예'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
