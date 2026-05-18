import { useCallback, useEffect, useMemo, useState } from 'react';
import DoctorHeader from '../components/doctor/DoctorHeader';
import { useNavigate } from 'react-router-dom';
import patientApi from '../api/patientApi';

const leftMenus = ['개요', '활력징후', '처방약', '검사 결과', '인수인계', '진료기록'];

const ROWS_PER_PAGE = 10;

const genderLabel = (g) => {
  if (g == null) return '-';
  if (g === 'MALE') return '남성';
  if (g === 'FEMALE') return '여성';
  if (g === 'OTHER') return '기타';
  return String(g);
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'STABLE':
      return '안정';
    case 'MONITORING':
      return '집중 관찰';
    case 'DISCHARGE':
      return '퇴원예정';
    case 'POSTOPERATIVE':
      return '수술후';
    case 'CRITICAL':
      return '위험';
    case 'DISCHARGED':
      return '퇴원완료';
    default:
      return '-';
  }
};

/** API camelCase(admissionDate) · snake_case(admission_date) 모두 지원 */
function getAdmissionDate(patient) {
  return patient?.admissionDate ?? patient?.admission_date ?? null;
}

function formatAdmissionDate(iso) {
  if (!iso) return '-';
  const s = typeof iso === 'string' ? iso.slice(0, 10) : String(iso).slice(0, 10);
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return s;
  return `${y}.${m}.${d}`;
}

const mealTone = (meal) => {
  if (!meal || meal === '-') return 'bg-slate-100 text-slate-500';
  if (meal.includes('금식')) return 'bg-red-50 text-red-500';
  if (meal.includes('연식') || meal.includes('죽')) return 'bg-amber-50 text-amber-600';
  return 'bg-indigo-50 text-indigo-500';
};

function wardLine(patient) {
  if (patient.building && patient.room) {
    return { ward: patient.building, room: `${patient.room}호` };
  }
  return { ward: '병실 미배정', room: '-' };
}

export default function DoctorPatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientApi.getPatients();
      const list = Array.isArray(response.data) ? response.data : [];
      setPatients(list.sort((a, b) => (b.patientId ?? 0) - (a.patientId ?? 0)));
    } catch (e) {
      console.error(e);
      setPatients([]);
      setError('환자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const admittedPatients = useMemo(
    () => patients.filter((p) => p.patientStatus !== 'DISCHARGED'),
    [patients],
  );

  const totalCount = admittedPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ROWS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [totalCount]);

  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return admittedPatients.slice(start, start + ROWS_PER_PAGE);
  }, [admittedPatients, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <DoctorHeader activeNav="patients" />

      <div className="mx-auto flex w-full max-w-[1360px] gap-8 px-5 py-6">
        <aside className="w-[180px] shrink-0 pt-10">
          <ul className="space-y-5 text-[18px] font-semibold text-slate-600">
            {leftMenus.map((m, idx) => (
              <li key={m} className={idx === 0 ? 'text-slate-900' : ''}>
                {m}
              </li>
            ))}
          </ul>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-[46px] font-bold text-[#1d2b3f]">환자 통합 관리</h1>
              <p className="mt-1 text-lg text-slate-500">
                {loading
                  ? '환자 목록을 불러오는 중…'
                  : `총 ${totalCount.toLocaleString()}명의 입원 환자가 등록되어 있습니다.`}
              </p>
              {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
            </div>
            <button type="button" className="rounded-xl bg-[#eef2f7] px-5 py-2 text-sm font-semibold text-slate-600">
              목록 인쇄
            </button>
          </div>

          <section className="rounded-2xl border border-[#e0e6f0] bg-white p-5">
            <div className="rounded-xl bg-[#f3f5fa] p-4">
              <div className="grid grid-cols-4 gap-4">
                {['병동 필터', '담당 의사', '입원일자 범위', '식단 유형'].map((label) => (
                  <div key={label}>
                    <p className="mb-2 text-xs font-bold text-slate-500">{label}</p>
                    <div className="rounded-lg border border-[#e4e9f2] bg-white px-4 py-3 text-sm text-slate-500">
                      {label === '병동 필터' && '전체 병동'}
                      {label === '담당 의사' && '전체 의사'}
                      {label === '입원일자 범위' && 'mm/dd/yyyy'}
                      {label === '식단 유형' && '전체 식단'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="rounded-lg bg-[#e9f1ff] px-3 py-2 text-xs font-semibold text-[#4a79c0]">
                병동 이동
              </button>
              <button type="button" className="rounded-lg bg-[#e9f1ff] px-3 py-2 text-xs font-semibold text-[#4a79c0]">
                식단 일괄변경
              </button>
              <button type="button" className="rounded-lg bg-[#fdeaea] px-3 py-2 text-xs font-semibold text-[#d06464]">
                퇴원 처리
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-[#e3e8f1]">
              <table className="w-full border-collapse bg-white text-left">
                <thead className="bg-[#f7f9fc] text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">환자 정보</th>
                    <th className="px-3 py-3">환자 ID</th>
                    <th className="px-3 py-3">병동 / 병실</th>
                    <th className="px-3 py-3">담당 요양사</th>
                    <th className="px-3 py-3">입원 일자</th>
                    <th className="px-3 py-3">식단 유형</th>
                    <th className="px-3 py-3">상태</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        불러오는 중…
                      </td>
                    </tr>
                  ) : currentRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        {error || '등록된 입원 환자가 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((patient) => {
                      const { ward, room } = wardLine(patient);
                      const meal = patient.dietType?.trim() || '-';
                      const ageText = patient.age != null ? `${patient.age}세` : '?세';

                      return (
                        <tr
                          key={patient.patientId}
                          className="cursor-pointer border-t border-[#edf1f7] hover:bg-[#f8fbff]"
                          onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
                        >
                          <td className="px-4 py-4">
                            <p className="font-bold text-slate-900">{patient.name ?? '-'}</p>
                            <p className="text-xs text-slate-400">
                              {ageText} / {genderLabel(patient.gender)}
                            </p>
                          </td>
                          <td className="px-3 py-4 font-mono text-xs text-slate-500">
                            {patient.patientId}
                          </td>
                          <td className="px-3 py-4">
                            <p className="font-semibold">{ward}</p>
                            <p className="text-xs text-slate-400">{room}</p>
                          </td>
                          <td className="px-3 py-4">{patient.primaryCaregiverName ?? '-'}</td>
                          <td className="px-3 py-4">{formatAdmissionDate(getAdmissionDate(patient))}</td>
                          <td className="px-3 py-4">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${mealTone(meal)}`}>
                              {meal}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-xs font-semibold text-slate-600">
                            {getStatusLabel(patient.patientStatus)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalCount > 0 && !loading ? (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-lg border border-[#e0e6ef] text-xs text-slate-400 disabled:opacity-40"
                >
                  ‹
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                      currentPage === page
                        ? 'bg-[#1f73d0] text-white'
                        : 'border border-[#e0e6ef] text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-lg border border-[#e0e6ef] text-xs text-slate-400 disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
