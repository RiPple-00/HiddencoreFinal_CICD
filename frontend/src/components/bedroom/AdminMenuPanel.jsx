const menus = ["중간 정산", "증명서 발급", "퇴원 수속", "보험 청구"];

function AdminMenuPanel() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900">행정 업무 퀵메뉴</h3>

      <div className="grid grid-cols-2 gap-3">
        {menus.map((menu) => (
          <button
            key={menu}
            className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            {menu}
          </button>
        ))}
      </div>
    </section>
  );
}

export default AdminMenuPanel;