import TopNavBar from '../components/bedroom/TopNavBar';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { key: 'rooms', label: '병동 관리', to: '/doctor' },
  { key: 'patients', label: '환자 조회', to: '/doctor/patients' },
  { key: 'calendar', label: '캘린더', to: '/schedule' },
  { key: 'notice', label: '게시판', to: '/facilities/1/board' },
];

const leftMenus = ['개요', '활력징후', '처방약', '검사 결과', '인수인계', '진료기록'];

const rows = [
  { name: '박지민', info: '32세 / 남성', id: '#ADM-2024-001', ward: '중환자실 (ICU)', room: '3층 - 302호', doctor: '김철수 원장', admitted: '2024.03.15', time: '11:20 입원', meal: '한눈식', status: '위급' },
  { name: '김소연', info: '28세 / 여성', id: '#ADM-2024-042', ward: '일반병동 (GEN)', room: '5층 - 508호', doctor: '이명희 과장', admitted: '2024.03.18', time: '09:15 입원', meal: '일반식', status: '안정' },
  { name: '최우식', info: '45세 / 남성', id: '#ADM-2024-112', ward: '소아과병동 (PED)', room: '2층 - 201호', doctor: '박지성 팀장', admitted: '2024.03.20', time: '11:00 입원', meal: '금식', status: '관찰 중' },
  { name: '한소희', info: '31세 / 여성', id: '#ADM-2024-088', ward: '일반병동 (GEN)', room: '4층 - 415호', doctor: '김철수 원장', admitted: '2024.03.12', time: '16:45 입원', meal: '일반식', status: '회복 중' },
  { name: '김종우', info: '31세 / 남성', id: '#ADM-2024-088', ward: '일반병동 (GEN)', room: '4층 - 415호', doctor: '김철수 원장', admitted: '2024.03.12', time: '16:45 입원', meal: '일반식', status: '회복 중' },
  { name: '박진우', info: '31세 / 여성', id: '#ADM-2024-088', ward: '일반병동 (GEN)', room: '4층 - 415호', doctor: '김철수 원장', admitted: '2024.03.12', time: '16:45 입원', meal: '일반식', status: '회복 중' },
];

const mealTone = (meal) => {
  if (meal === '금식') return 'bg-red-50 text-red-500';
  if (meal === '한눈식') return 'bg-amber-50 text-amber-600';
  return 'bg-indigo-50 text-indigo-500';
};

export default function DoctorPatientListPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <TopNavBar activeNav="patients" navItems={navItems} brandLabel="따숨" userName="김관리자 (Admin Kim)" userRole="SUPERUSER" />

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
              <p className="mt-1 text-lg text-slate-500">총 12명의 입원 환자가 등록되어 있습니다.</p>
            </div>
            <button className="rounded-xl bg-[#eef2f7] px-5 py-2 text-sm font-semibold text-slate-600">목록 인쇄</button>
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
              <button className="rounded-lg bg-[#e9f1ff] px-3 py-2 text-xs font-semibold text-[#4a79c0]">병동 이동</button>
              <button className="rounded-lg bg-[#e9f1ff] px-3 py-2 text-xs font-semibold text-[#4a79c0]">식단 일괄변경</button>
              <button className="rounded-lg bg-[#fdeaea] px-3 py-2 text-xs font-semibold text-[#d06464]">퇴원 처리</button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-[#e3e8f1]">
              <table className="w-full border-collapse bg-white text-left">
                <thead className="bg-[#f7f9fc] text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">환자 정보</th>
                    <th className="px-3 py-3">환자 ID</th>
                    <th className="px-3 py-3">병동 / 병실</th>
                    <th className="px-3 py-3">담당의</th>
                    <th className="px-3 py-3">입원 일자</th>
                    <th className="px-3 py-3">식단 유형</th>
                    <th className="px-3 py-3">상태</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {rows.map((row, idx) => (
                    <tr
                      key={`${row.id}-${row.name}`}
                      className={`border-t border-[#edf1f7] ${idx === 0 ? 'cursor-pointer hover:bg-[#f8fbff]' : ''}`}
                      onClick={idx === 0 ? () => navigate('/doctor/patients/ADM-2024-001') : undefined}
                    >
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.info}</p>
                      </td>
                      <td className="px-3 py-4 font-mono text-xs text-slate-500">{row.id}</td>
                      <td className="px-3 py-4">
                        <p className="font-semibold">{row.ward}</p>
                        <p className="text-xs text-slate-400">{row.room}</p>
                      </td>
                      <td className="px-3 py-4">{row.doctor}</td>
                      <td className="px-3 py-4">
                        <p>{row.admitted}</p>
                        <p className="text-xs text-slate-400">{row.time}</p>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${mealTone(row.meal)}`}>{row.meal}</span>
                      </td>
                      <td className="px-3 py-4 text-xs font-semibold text-slate-600">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="h-8 w-8 rounded-lg border border-[#e0e6ef] text-xs text-slate-400">‹</button>
              <button className="h-8 w-8 rounded-lg bg-[#1f73d0] text-xs font-semibold text-white">1</button>
              <button className="h-8 w-8 rounded-lg border border-[#e0e6ef] text-xs text-slate-600">2</button>
              <button className="h-8 w-8 rounded-lg border border-[#e0e6ef] text-xs text-slate-400">›</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
