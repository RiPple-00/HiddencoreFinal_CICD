const items = [
  { label: '중간 정산', glyph: '🧾' },
  { label: '증명서 발급', glyph: '📄' },
  { label: '회원 수속', glyph: '🪪' },
  { label: '보험 청구', glyph: '💳' },
];

export default function AdminQuickMenu() {
  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-900">퀵 메뉴</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ label, glyph }) => (
          <button
            key={label}
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#eef0f4] bg-[#f7f8fa] px-3 py-4 text-center transition hover:border-[#cfe0ff] hover:bg-[#eef4ff]"
          >
            <span className="text-2xl leading-none">{glyph}</span>
            <span className="text-xs font-bold text-slate-700">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}