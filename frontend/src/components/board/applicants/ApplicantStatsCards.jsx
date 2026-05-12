// 모집 정원, 확정 인원, 대기 인원, 남은 기간을 카드 형태로 보여주는 컴포넌트

const formatRemainingDays = (remainingDays) => {
  if (remainingDays == null) return '-';
  if (remainingDays < 0) return '마감';
  if (remainingDays === 0) return 'D-Day';
  return `D-${remainingDays}`;
};

const ApplicantStatsCards = ({ programInfo }) => {
  const cards = [
    { label: '모집 정원', value: `${programInfo?.totalQuota ?? 0}명`, tone: 'text-slate-900' },
    { label: '확정 인원', value: `${programInfo?.confirmedCount ?? 0}명`, tone: 'text-blue-700' },
    { label: '대기 인원', value: `${programInfo?.waitingCount ?? 0}명`, tone: 'text-teal-700' },
    { label: '남은 기간', value: formatRemainingDays(programInfo?.remainingDays), tone: 'text-red-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ApplicantStatsCards;