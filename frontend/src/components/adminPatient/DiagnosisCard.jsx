const BADGE_URGENT = { label: '긴급', className: 'bg-[#fee2e2] text-[#dc2626]' };
const BADGE_POSTOP = { label: '수술 후 모니터링', className: 'bg-[#f1f5f9] text-[#64748b]' };

export default function DiagnosisCard({ patient }) {
  const diagnosis =
    patient?.memo && patient.memo.length < 80 && !patient.memo.includes('\n')
      ? patient.memo
      : '급성 충수염 (Acute Appendicitis)';

  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0f0] text-[#e53e3e]">
          <span className="text-base leading-none">🧾</span>
        </div>
        <h2 className="text-lg font-bold text-[#1a1f2e]">진단명</h2>
      </div>
      <p className="text-base font-bold text-[#e53e3e]">{diagnosis}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_URGENT.className}`}>
          {BADGE_URGENT.label}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_POSTOP.className}`}>
          {BADGE_POSTOP.label}
        </span>
      </div>
    </section>
  );
}
