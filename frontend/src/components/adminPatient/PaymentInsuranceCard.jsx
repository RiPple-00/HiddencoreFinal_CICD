export default function PaymentInsuranceCard({ payments = [] }) {
  const hasPayments = Array.isArray(payments) && payments.length > 0;
  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#15803d]">
            <span className="text-base leading-none">💳</span>
          </div>
          <h2 className="text-lg font-bold text-[#1a1f2e]">수납 및 보험</h2>
        </div>
        <span className="rounded-full bg-[#e8f0ff] px-3 py-1 text-xs font-bold text-[#2d5bff]">
          건강보험공단 (NHIS)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#eef0f4] bg-[#f7f8fa] px-4 py-3">
          <p className="text-xs font-medium text-slate-500">총 진료비</p>
          <p className="mt-1 text-lg font-bold text-slate-800">{hasPayments ? '문서 확인' : '-'}</p>
        </div>
        <div className="rounded-xl border border-[#cfe0ff] bg-[#eef4ff] px-4 py-3">
          <p className="text-xs font-medium text-[#2d5bff]">납부 금액</p>
          <p className="mt-1 text-lg font-bold text-[#2d5bff]">{hasPayments ? '문서 확인' : '-'}</p>
        </div>
        <div className="rounded-xl border border-[#eef0f4] bg-[#f7f8fa] px-4 py-3">
          <p className="text-xs font-medium text-slate-500">미수금</p>
          <p className="mt-1 text-lg font-bold text-slate-400">{hasPayments ? '문서 확인' : '-'}</p>
        </div>
      </div>

      {hasPayments ? (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          최근 수납 문서: {payments[0]?.title || '-'} ({payments[0]?.status || '-'})
        </div>
      ) : null}
    </section>
  );
}
