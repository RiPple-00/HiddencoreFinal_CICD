const menus = ["개요", "활력징후", "처방약", "검사 결과", "간호노트", "진료기록"];

function BedSidebar() {
  return (
    <aside className="w-[240px] rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-3xl font-bold text-slate-900">302호</h2>
        <p className="mt-1 text-sm text-slate-500">병동 A - 북측 윙</p>
      </div>

      <nav className="space-y-2">
        {menus.map((menu, index) => (
          <button
            key={menu}
            className={`w-full rounded-2xl px-4 py-3 text-left font-semibold ${
              index === 0
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {menu}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default BedSidebar;