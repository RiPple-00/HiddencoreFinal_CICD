import Header from '../components/common/Header';

const navItems = [
  { key: 'rooms', label: '병동 관리', to: '/doctor' },
  { key: 'patients', label: '환자 조회', to: '/doctor/patients' },
  { key: 'calendar', label: '캘린더', to: '/schedule' },
  { key: 'notice', label: '게시판', to: '/facilities/1/board' },
];

const weeks = [
  ['28', '29', '30', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9', '10', '11'],
  ['12', '13', '14', '15', '16', '17', '18'],
  ['19', '20', '21', '22', '23', '24', '25'],
  ['26', '27', '28', '29', '30', '31', '1'],
];

export default function DoctorCalendarPage() {
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Header activeNav="calendar" navItems={navItems} brandLabel="따숨" userName="김관리자 (Admin Kim)" userRole="SUPERUSER" />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-6">
        <section className="mb-4 rounded-2xl border border-[#e1e6ef] bg-white p-5">
          <div className="flex items-center gap-3">
            <h1 className="text-[48px] font-bold text-[#1f2d40]">2024년 5월</h1>
            <button className="text-2xl text-slate-500">‹</button>
            <button className="rounded-lg bg-[#f2f5fa] px-4 py-2 text-sm font-semibold text-[#3d6ab1]">오늘</button>
            <button className="text-2xl text-slate-500">›</button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e1e6ef] bg-white p-4">
          <div className="grid grid-cols-7 border-b border-[#ebeff5] pb-3 text-center text-sm font-semibold text-slate-500">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
              <div key={d} className={idx === 0 || idx === 6 ? 'text-[#b66f80]' : ''}>
                {d}
              </div>
            ))}
          </div>

          <div className="mt-2">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7">
                {week.map((day, dIdx) => (
                  <div key={`${wIdx}-${dIdx}`} className="relative h-[132px] border-r border-b border-[#eef2f7] p-2 last:border-r-0">
                    <span className={`text-sm ${wIdx === 0 && dIdx < 3 ? 'text-slate-300' : 'text-slate-700'}`}>{day}</span>

                    {day === '1' && (
                      <div className="mt-2 rounded-md bg-[#deecfb] px-2 py-1 text-xs text-[#40659b]">오전 정기 점검 (3)</div>
                    )}
                    {day === '7' && (
                      <div className="mt-2 rounded-md bg-[#c8f0ef] px-2 py-1 text-xs text-[#2f7b78]">컨퍼런스 콜</div>
                    )}
                    {day === '9' && (
                      <>
                        <div className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#4d6ed5]" />
                        <div className="mt-2 rounded-md bg-[#6d87e8] px-2 py-1 text-xs text-white">수술 일정 - 이정희</div>
                        <div className="mt-1 rounded-md bg-[#dfe8fb] px-2 py-1 text-xs text-[#3f5d95]">||| ||| (12)</div>
                      </>
                    )}
                    {day === '18' && (
                      <div className="mt-2 rounded-md bg-[#6d87e8] px-2 py-1 text-xs text-white">수술 일정 - 김태무</div>
                    )}
                    {day === '20' && (
                      <div className="mt-2 rounded-md bg-[#6d87e8] px-2 py-1 text-xs text-white">수술 일정 - 김태희</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
