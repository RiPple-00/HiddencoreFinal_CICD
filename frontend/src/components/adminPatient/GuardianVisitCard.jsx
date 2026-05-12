function Avatar({ initials }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2d5bff] text-xs font-bold text-white">
      {initials}
    </div>
  );
}

export default function GuardianVisitCard({ guardians = [], visitRequests = [] }) {
  const primary =
    guardians.find((g) => g?.isPrimary) ?? guardians[0] ?? null;
  const recent = Array.isArray(visitRequests) ? visitRequests : [];

  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#6d28d9]">
          <span className="text-base leading-none">👥</span>
        </div>
        <h2 className="text-lg font-bold text-[#1a1f2e]">보호자 및 방문객</h2>
      </div>

      <div className="mb-5 rounded-xl bg-[#e8f0ff] px-4 py-3">
        <p className="text-xs font-medium text-[#2d5bff]">주 보호자</p>
        <p className="mt-1 text-sm font-bold text-slate-900">
          {primary ? `${primary.guardianName} (${primary.relationship || '-'})` : '-'}
        </p>
        <p className="mt-0.5 text-sm text-slate-600">{primary?.guardianPhone || '-'}</p>
      </div>

      <p className="mb-2 text-xs font-semibold text-slate-400">최근 방문</p>
      <ul className="space-y-3">
        {recent.length === 0 ? (
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            방문 기록이 없습니다.
          </li>
        ) : (
          recent.slice(0, 2).map((d) => {
            const name = d?.title?.includes('—')
              ? d.title.split('—').slice(1).join('—').trim()
              : d?.title ?? '방문';
            const initials = String(name).slice(0, 2).toUpperCase();
            const at = d?.requestedAt || d?.createdAt;
            const timeText = at ? String(at).slice(0, 16).replace('T', ' ') : '-';
            const status = d?.status || '-';
            const isActive = status === 'APPROVED' || status === 'PENDING_APPROVAL' || status === 'REQUESTED';
            return (
              <li key={d.documentId ?? `${name}-${timeText}`} className="flex items-center gap-3">
                <Avatar initials={initials} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{timeText}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isActive ? 'bg-[#2d5bff] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {status}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}