import Header from '../components/common/Header';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { key: 'rooms', label: '병동 관리', to: '/doctor' },
  { key: 'patients', label: '환자 조회', to: '/doctor' },
  { key: 'calendar', label: '캘린더', to: '/schedule' },
  { key: 'notice', label: '게시판', to: '/facilities/1/board' },
];

const patients = [
  { id: 1, name: '이정훈 (M/64)', summary: 'Post-op Recovery / RM 402', status: 'CRITICAL', statusText: 'SpO2 88%' },
  { id: 2, name: '박지원 (F/29)', summary: 'Acute Gastritis / RM 205', status: 'MONITORING', statusText: 'Pain Scale 6' },
  { id: 3, name: '강성민 (M/72)', summary: 'Routine Check / RM 311', status: 'STABLE', statusText: 'Next BP Check: 14:00' },
];

const notices = [
  { type: 'URGENT', text: '5월 정기 소방 점검 및 대피 훈련 실시 안내 (5/15)', date: '24.05.04' },
  { type: 'INFO', text: '신규 의료 영상 시스템(PACS) 업데이트 및 사용 교육', date: '24.05.02' },
  { type: 'NOTICE', text: '제 1주차동 보수 공사에 따른 차량 통제 안내', date: '24.04.28' },
];

const calendarRows = [
  [
    { day: '27', muted: true },
    { day: '28', muted: true },
    { day: '29', muted: true },
    { day: '30', muted: true },
    { day: '1', band: 'bg-[#f4d8ac]', event: true },
    { day: '2', band: 'bg-[#dbe9d7]', event: true },
    { day: '3', band: 'bg-[#dbe9d7]', event: true },
  ],
  [
    { day: '4', band: 'bg-[#f4d8ac]', event: true },
    { day: '5', band: 'bg-[#f4d8ac]', event: true },
    { day: '6', band: 'bg-[#efc8cc]', event: true },
    { day: '7', band: 'bg-[#efc8cc]', event: true },
    { day: '8', band: 'bg-[#d6d9ed]', event: true },
    { day: '9', band: 'bg-[#dbe9d7]', event: true },
    { day: '10', band: 'bg-[#d6d9ed]', event: true },
  ],
];

export default function DoctorMainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Header
        activeNav="patients"
        navItems={navItems}
        brandLabel="따숨"
        userName="김관리자 (Admin Kim)"
        userRole="SUPERUSER"
      />

      <div className="mx-auto max-w-[1360px] space-y-5 px-5 py-6">
        <section className="rounded-xl border border-[#f0d2d2] bg-[#fff8f8] px-5 py-3 text-sm font-semibold text-[#ad2727]">
          ✱ 긴급: B203 | 이○훈 vital CHECK
          <span className="float-right text-xs font-bold tracking-wide text-[#9d1b1b]">REVIEW NOW</span>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <button
            type="button"
            onClick={() => navigate('/doctor/calendar')}
            className="w-full rounded-xl border border-[#dde4ee] bg-white p-5 text-left transition hover:bg-[#f8fbff]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[38px] font-bold leading-none text-[#1f2c3f]">Schedule Overview</h2>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>October 2024</span>
                <span>‹</span>
                <span>›</span>
                <div className="ml-2 rounded-md border border-[#c6d1e2] bg-[#f7fbff] p-0.5">
                  <button className="rounded px-3 py-1 text-xs font-semibold text-[#315ea2]">Week</button>
                  <button className="px-3 py-1 text-xs text-slate-500">Day</button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#dae2ee] bg-[#fafcfe]">
              <div className="grid grid-cols-7 border-b border-[#e3e8f1] bg-[#e9f0fb] text-center text-[11px] font-bold text-[#4670a8]">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-[#72809a]">
                {calendarRows.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-7">
                    {row.map((cell, cellIdx) => (
                      <div
                        key={`${rowIdx}-${cellIdx}`}
                        className="relative h-[118px] border-r border-b border-[#e7ecf4] bg-white p-2 last:border-r-0"
                      >
                        {cell.band && <div className={`absolute left-0 right-0 top-0 h-5 ${cell.band}`} />}
                        <p className={`relative z-10 text-xs ${cell.muted ? 'text-slate-300' : 'text-slate-700'}`}>{cell.day}</p>

                        {cell.event && (
                          <>
                            <div className="mt-1 flex items-center justify-between rounded bg-[#dde8fb] px-1.5 py-0.5 text-[10px] text-[#2a4673]">
                              <span>수술</span>
                              <span>09:00</span>
                            </div>
                            <p className="absolute bottom-2 right-2 text-[11px] text-[#41597d]">진료예약: 8</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#f4d8ac]" />Morning (D)</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#efc8cc]" />Evening (E)</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#d6d9ed]" />Night (N)</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#dbe9d7]" />DayOff (X)</span>
            </div>
          </button>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate('/doctor/patients')}
              className="w-full rounded-xl border border-[#dbe6f5] bg-[#ecf3ff] p-5 text-left transition hover:bg-[#e4eeff]"
            >
              <p className="text-[11px] font-bold tracking-wide text-[#7e95bd]">CLINIC OPERATIONS</p>
              <p className="mt-1 text-[38px] font-bold leading-tight text-[#3f6aab]">환자 목록 보기</p>
              <p className="mt-2 text-sm font-medium text-[#5f79a0]">현재 담당 12명 →</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/doctor/handover')}
              className="w-full rounded-xl border border-[#7f9ed8] bg-[#7aa0df] p-5 text-left text-white transition hover:bg-[#6e95d8]"
            >
              <p className="text-[11px] font-bold tracking-wide text-[#d8e5ff]">HANDOVER LOGS</p>
              <p className="mt-1 text-[38px] font-bold leading-tight">인수인계 조회</p>
              <p className="mt-2 text-sm text-[#eef4ff]">최근 업데이트 14분 전 →</p>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#dde4ee] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[32px] font-bold text-[#232f42]">주요 환자 관리</h3>
              <span className="text-xs font-semibold text-[#20a3c3]">3 URGENT</span>
            </div>
            <div className="space-y-2">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between rounded-lg border border-[#e5e9f1] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="mr-3 h-10 w-1 rounded-full bg-[#3b7de3]" />
                    <div>
                      <p className="text-xl font-bold text-slate-900">{patient.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{patient.summary}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-[#7a8291]">{patient.status}</p>
                    <p className="mt-1 text-sm font-semibold text-[#3f4b61]">{patient.statusText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#dde4ee] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[32px] font-bold text-[#232f42]">오늘의 인수인계</h3>
              <span className="text-xs font-semibold text-[#7591bf]">HISTORY</span>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-[#e4e8ef] bg-[#f8fafd] p-4">
                <p className="text-[11px] font-bold text-[#19a8c6]">INCOMING FROM NIGHT SHIFT</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  402호 이정훈 환자 새벽 03:20부터 호흡 곤란 호소하여 O2 2L 투여 시작함.
                  주치의 원팀 후 추가 처방 대기 중.
                </p>
                <p className="mt-2 text-[11px] text-slate-400">Reporter: Dr. Park (Night Shift)</p>
              </div>
              <div className="rounded-lg border border-[#e4e8ef] bg-[#f8fafd] p-4">
                <p className="text-[11px] font-bold text-[#4b78d1]">MY CURRENT NOTES</p>
                <button
                  type="button"
                  onClick={() => navigate('/doctor/handover/memo')}
                  className="mt-2 w-full rounded-md border border-[#edf1f6] bg-white px-3 py-4 text-left text-sm text-slate-400 transition hover:bg-[#f8fbff]"
                >
                  다음 근무자에게 전달할 메모를 입력하세요.
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-[#dde4ee] bg-white p-5">
            <h3 className="mb-3 text-[32px] font-bold text-[#232f42]">전체 시설 공지사항</h3>
            <div className="space-y-2">
              {notices.map((notice, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-[#e6eaf2] px-4 py-3">
                  <div className="min-w-0">
                    <span className="mr-2 text-xs font-bold text-slate-500">{notice.type}</span>
                    <span className="text-sm text-slate-700">{notice.text}</span>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-slate-400">{notice.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#dde4ee] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[32px] font-bold text-[#232f42]">구내 식당 메뉴</h3>
              <span className="text-xs font-semibold text-slate-400">TODAY</span>
            </div>
            <div className="mb-2 flex items-center gap-4 text-sm text-slate-400">
              <span>Breakfast</span>
              <span className="font-semibold text-[#35a5bf]">Lunch</span>
              <span>Dinner</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[28px] font-bold text-slate-900">영양 한우 불고기 & 쌈채소</p>
                <p className="mt-2 text-sm text-slate-500">흑미밥, 소고기무국, 고등어구이, 시금치나물, 포기김치, 과일샐러드</p>
                <p className="mt-4 text-xs font-semibold text-[#2c95a9]">🥗 SPECIAL DIET AVAILABLE</p>
              </div>
              <div className="h-20 w-28 shrink-0 rounded-lg bg-gradient-to-br from-[#e9eef5] to-[#c7d0dd]" />
            </div>
          </div>
        </section>

        <footer className="flex justify-between border-t border-[#e5e9f2] pt-5 text-xs text-slate-400">
          <span>© 2024 PRECISION MEDICAL SYSTEMS. ALL RIGHTS RESERVED.</span>
          <span>SUPPORT CENTER · PRIVACY PROTOCOL · TERMS OF SERVICE</span>
        </footer>
      </div>
    </div>
  );
}
