export default function SectionCard({ title, icon, children, rightSlot }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm text-slate-500">{icon}</span>}
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}