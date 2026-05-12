function VisitorsPanel() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900">면회 · 방문</h3>
      <p className="text-sm text-slate-600">
        예정된 면회 일정과 방문객 안내가 이 영역에 표시됩니다.
      </p>
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
        등록된 면회 예약이 없습니다.
      </div>
    </section>
  );
}

export default VisitorsPanel;
