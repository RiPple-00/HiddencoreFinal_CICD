import Header from '../components/common/Header';

const navItems = [
  { key: 'rooms', label: '병동 관리', to: '/doctor' },
  { key: 'patients', label: '환자 조회', to: '/doctor/patients' },
  { key: 'calendar', label: '캘린더', to: '/schedule' },
  { key: 'notice', label: '게시판', to: '/facilities/1/board' },
];

const sideMenus = ['개요', '활력징후', '처방약', '검사 결과', '인수인계', '진료기록'];

export default function DoctorHandoverMemoPage() {
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Header activeNav="rooms" navItems={navItems} brandLabel="따숨" userName="김관리자 (Admin Kim)" userRole="SUPERUSER" />

      <div className="mx-auto flex w-full max-w-[1360px] gap-8 px-5 py-6">
        <aside className="w-[180px] shrink-0 border-r border-[#e5eaf3] pt-10">
          <ul className="space-y-5 text-[22px] font-semibold text-slate-600">
            {sideMenus.map((menu) => (
              <li key={menu} className={menu === '인수인계' ? 'rounded-lg bg-[#eef3ff] px-3 py-2 text-[#2f6dc4]' : ''}>
                {menu}
              </li>
            ))}
          </ul>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-[58px] font-bold text-[#1f2d40]">인수인계 메모</h1>
              <p className="mt-1 text-xl text-slate-500">다음 근무 교대를 위한 명확한 임상 요약을 작성하세요.</p>
            </div>
            <span className="rounded-full bg-[#e9f1ff] px-4 py-2 text-sm font-semibold text-[#3576ca]">● 실시간 편집 중</span>
          </div>

          <section className="rounded-2xl border border-[#dfe5ef] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#f3f6fb] px-4 py-2 text-sm font-semibold text-slate-700">의사: 김OO</div>
                <div className="rounded-lg bg-[#f3f6fb] px-4 py-2 text-sm font-semibold text-slate-600">2023.10.27</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#f3f6fb] px-4 py-2 text-sm font-semibold text-slate-700">환자 목록</div>
                <span className="text-sm text-slate-400">우선순위: 보통</span>
              </div>
            </div>

            <textarea
              className="h-[520px] w-full resize-none rounded border border-[#e2e7f0] bg-[#fcfdff] p-4 text-base text-slate-600"
              placeholder="전달할 내용을 입력하세요..."
            />

            <div className="mt-4 flex justify-end gap-3">
              <button className="rounded-lg px-5 py-2 text-base font-semibold text-slate-500">취소</button>
              <button className="rounded-xl bg-[#1f73d0] px-8 py-3 text-base font-semibold text-white shadow">저장 및 전송</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
