const BADGE_MONITORING = { label: '집중관찰', className: 'bg-[#fef3c7] text-[#b45309]' };
const BADGE_DEMENTIA = { label: '인지 저하', className: 'bg-[#ede9fe] text-[#6d28d9]' };

export default function DiagnosisCard({ patient }) {
  const diagnosis =
    patient?.admissionStatus?.trim()
    || (patient?.memo && patient.memo.length < 80 && !patient.memo.includes('\n')
      ? patient.memo.trim()
      : null)
    || '진단 정보 없음';

  const comment = patient?.memo?.includes('\n') || (patient?.admissionStatus && patient?.memo)
    ? patient?.memo?.trim()
    : null;

  const badges =
    patient?.patientStatus === 'MONITORING'
      ? [BADGE_MONITORING, BADGE_DEMENTIA]
      : [BADGE_MONITORING];

  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0f0] text-[#e53e3e]">
          <span className="text-base leading-none">🧾</span>
        </div>
        <h2 className="text-lg font-bold text-[#1a1f2e]">진단명</h2>
      </div>
      <p className="whitespace-pre-line text-base font-bold leading-snug text-[#e53e3e]">{diagnosis}</p>
      {comment ? (
        <div className="mt-4 rounded-xl bg-[#f8fafc] p-4">
          <p className="mb-2 text-xs font-bold text-slate-500">진단 코멘트</p>
          <p className="text-sm leading-relaxed text-slate-700">{comment}</p>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
        ))}
      </div>
    </section>
  );
}
