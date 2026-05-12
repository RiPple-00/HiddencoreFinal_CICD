export default function GuardianAlertCard() {
  return (
    <section className="rounded-2xl border border-[#fecaca] bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-lg font-bold text-slate-900">보호자 관리</h3>
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-bold text-[#e53e3e]">긴급 보호자 호출</p>
        <p className="mt-2 text-base font-bold text-slate-900">김철수 (301-A) 보호자</p>
        <p className="mt-1 text-sm text-slate-600">미서명 동의서 · 즉시 연락 필요</p>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-[#e53e3e] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#dc2626]"
        >
          즉시 통화하기
        </button>
      </div>
    </section>
  );
}