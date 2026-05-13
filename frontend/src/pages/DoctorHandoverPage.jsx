import Header from '../components/common/Header';

const navItems = [
  { key: 'rooms', label: '병동 관리', to: '/doctor' },
  { key: 'patients', label: '환자 조회', to: '/doctor/patients' },
  { key: 'calendar', label: '캘린더', to: '/schedule' },
  { key: 'notice', label: '게시판', to: '/facilities/1/board' },
];

const sideMenus = ['개요', '활력징후', '처방약', '검사 결과', '인수인계', '진료기록'];

const timelineLeft = [
  {
    time: '08:30 AM',
    tag: 'ROUTINE',
    title: '병동 라운딩 및 환자 상태 체크',
    body: '302호 김*수 환자 혈압 안정 (120/80). 전반적인 컨디션 양호함.',
    note: '#혈압   #라운딩',
    tone: 'blue',
  },
  {
    time: '10:15 AM',
    tag: 'MEDICATION',
    title: '약물 투여 및 부작용 모니터링',
    body: '405호 박*영 환자 정맥 주사 투여 후 약간의 메스꺼움 호소. 담담의 보고 완료.',
    note: '△ 추적 관찰 필요',
    tone: 'amber',
  },
  {
    time: '12:30 PM',
    tag: 'DIETARY',
    title: '점심 식사 보조 및 섭취량 기록',
    body: '대부분의 환자 식사 완료. 식욕 부진 환자 없음.',
    note: '',
    tone: 'slate',
  },
  {
    time: '02:45 PM',
    tag: 'REPORT',
    title: '수술 환자 입실 및 인계',
    body: '301호 이*철 환자 수술 후 병동 복귀. 활력 징후 체크 및 배액관 관리 시작.',
    note: '',
    tone: 'blue',
  },
];

const timelineRight = [
  {
    time: '12:30 PM',
    tag: 'DIETARY',
    title: '점심 식사 보조 및 섭취량 기록',
    body: '대부분의 환자 식사 완료. 식욕 부진 환자 없음.',
    note: '',
    tone: 'slate',
  },
  {
    time: '10:15 AM',
    tag: 'MEDICATION',
    title: '수술 예정',
    body: '201호 김0영 환자 수술 예정',
    note: '△ 중요',
    tone: 'amber',
  },
  {
    time: '08:30 AM',
    tag: 'ROUTINE',
    title: '병동 라운딩 및 환자 상태 체크',
    body: '302호 김*수 환자 혈압 안정 (120/80). 전반적인 컨디션 양호함.',
    note: '#혈압   #라운딩',
    tone: 'blue',
  },
  {
    time: '02:45 PM',
    tag: 'REPORT',
    title: '수술 환자 입실 및 인계',
    body: '301호 이*철 환자 수술 후 병동 복귀. 활력 징후 체크 및 배액관 관리 시작.',
    note: '',
    tone: 'blue',
  },
];

const toneClass = (tone) => {
  if (tone === 'amber') return 'border-l-[#b67418] text-[#b67418]';
  if (tone === 'slate') return 'border-l-[#e2e8f0] text-slate-400';
  return 'border-l-[#2f7ad8] text-[#2f7ad8]';
};

function TimelineCard({ item }) {
  return (
    <div className={`rounded-xl border border-[#e4e9f2] bg-white p-4 shadow-sm`}>
      <div className="mb-2 flex items-center justify-between text-xs font-bold">
        <span className={item.tone === 'amber' ? 'text-[#b67418]' : item.tone === 'slate' ? 'text-slate-400' : 'text-[#2f7ad8]'}>{item.time}</span>
        <span className={item.tone === 'amber' ? 'text-[#b67418]' : item.tone === 'slate' ? 'text-slate-400' : 'text-[#2f7ad8]'}>{item.tag}</span>
      </div>
      <div className={`border-l-[3px] pl-3 ${toneClass(item.tone)}`}>
        <p className="text-[24px] font-bold text-slate-800">{item.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.body}</p>
        {item.note && <p className="mt-2 text-xs font-semibold">{item.note}</p>}
      </div>
    </div>
  );
}

export default function DoctorHandoverPage() {
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
          <div>
            <h1 className="text-[58px] font-bold text-[#1f2d40]">인수인계 조회</h1>
            <p className="mt-1 text-xl text-slate-500">오전 근무(Day Shift) 활동 기록 및 최종 인계 사항 정리</p>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[#2f7ad8]">◷</span>
              <p className="text-[38px] font-bold text-[#1f2d40]">인수인계 업데이트</p>
              <span className="text-sm font-semibold text-slate-500">오후, 10월 14일</span>
            </div>
            <div className="w-[340px] rounded-full bg-[#edf1f7] px-4 py-2 text-sm text-slate-400">🔍 환자 검색...</div>
          </div>

          <section className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              {timelineLeft.map((item, idx) => (
                <TimelineCard key={`${item.time}-${idx}`} item={item} />
              ))}
            </div>
            <div className="space-y-5">
              {timelineRight.map((item, idx) => (
                <TimelineCard key={`${item.time}-${idx}`} item={item} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
