import TopNavBar from '../components/bedroom/TopNavBar';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { key: 'rooms', label: '병동 관리', to: '/doctor' },
  { key: 'patients', label: '환자 조회', to: '/doctor/patients' },
  { key: 'calendar', label: '캘린더', to: '/schedule' },
  { key: 'notice', label: '게시판', to: '/facilities/1/board' },
];

const timeline = [
  { date: '2024.05.10', text: '간헐적 기침 및 미열 관찰. 해열제 처방 후 증상 완화.' },
  { date: '2024.04.22', text: '낙상 주의 교육 실시. 보행 보조기 사용 상태 점검.' },
  { date: '2024.03.15', text: '정기 혈액 검사 시행. 콜레스테롤 수치 안정적.' },
];

const meds = [
  { name: '벤토린 HFA (알부테롤)', dose: '90 mcg | 필요 시 | 4-6시간마다 2회 흡입' },
  { name: '어드베어 디스커스', dose: '250 mcg / 50 mcg | 1일 2회, 1회 흡입' },
  { name: '타이레놀', dose: '50 mcg | 필요 시 8시간마다 1회 흡입' },
  { name: '아스피린', dose: '40 mcg / 50 mcg | 1일 2회, 1회 흡입' },
];

export default function DoctorPatientDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <TopNavBar activeNav="rooms" navItems={navItems} brandLabel="따숨" userName="김관리자 (Admin Kim)" userRole="SUPERUSER" />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-6">
        <section className="rounded-md border border-[#d6deea] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded border border-[#dce4ef] text-2xl text-slate-500">◌</div>
              <div>
                <p className="text-[38px] font-bold text-[#1f2d41]">박지민 <span className="text-[22px] font-semibold text-slate-500">(F/78)</span></p>
                <p className="text-base text-slate-500">환자 ID: 992-00-4821 | 병실: 302호-A</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10 text-center">
              <div>
                <p className="text-xs font-bold text-slate-400">주진단</p>
                <p className="mt-2 text-2xl font-bold text-slate-700">알츠하이머 치매</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">식사</p>
                <p className="mt-2 text-2xl font-bold text-slate-700">저염식</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-md border border-[#d6deea] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[30px] font-bold text-[#263449]">과거력 요약</h2>
              <button className="text-sm font-semibold text-[#3d6ab1]">전체 보기</button>
            </div>
            <div className="space-y-6 border-l border-[#e8edf5] pl-6">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-[#c5cfdf] bg-white" />
                  <p className="text-sm font-bold text-slate-700">{item.date}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[#d6deea] bg-white p-5">
            <div className="mb-3 flex items-center justify-between border-b border-[#e6ebf4] pb-3">
              <h2 className="text-[30px] font-bold text-[#263449]">신규 진료 기록</h2>
              <p className="text-sm text-slate-500">작성일: 2024.05.15</p>
            </div>

            <p className="text-xs font-bold text-slate-500">진단명 (ICD-10)</p>
            <div className="mt-2 flex gap-2">
              <input value="J45.909" readOnly className="w-full rounded border border-[#d7dfeb] bg-[#f8fafd] px-3 py-2 text-sm" />
              <button className="rounded border border-[#d4dceb] bg-[#eef3fb] px-4 py-2 text-sm font-semibold text-slate-600">검색</button>
            </div>
            <p className="mt-2 text-xs text-[#5273a5]">상세설명: 천식 (Asthma, unspecified)</p>

            <p className="mt-4 text-xs font-bold text-slate-500">임상 소견 및 특이사항</p>
            <textarea
              className="mt-2 h-36 w-full resize-none rounded border border-[#d7dfeb] bg-[#f8fafd] p-3 text-sm text-slate-600"
              placeholder="진료 내용을 입력하세요..."
            />

            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded border border-[#d4dceb] bg-white px-5 py-2 text-sm font-semibold text-slate-600">임시 저장</button>
              <button className="rounded bg-[#1f73d0] px-5 py-2 text-sm font-semibold text-white">진료 완료 및 전송</button>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[30px] font-bold text-[#263449]">핵심 처방 목록</h2>
            <button className="text-sm font-semibold text-[#3d6ab1]">+ 약물 추가하기</button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {meds.map((med, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md border border-[#d6deea] bg-white px-4 py-3">
                <div>
                  <p className="text-base font-bold text-slate-800">{med.name}</p>
                  <p className="text-xs text-slate-500">{med.dose}</p>
                </div>
                <button className="text-xl text-slate-400">×</button>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6">
          <button onClick={() => navigate('/doctor/patients')} className="text-sm font-semibold text-[#3d6ab1]">
            ← 환자 목록으로
          </button>
        </div>
      </div>
    </div>
  );
}
