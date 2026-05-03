function TransferRequestCard({ item }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border p-4 ${
        item.type === "urgent"
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div>
        <p className="text-lg font-bold text-slate-900">
          {item.name} ({item.age}세)
        </p>
        <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
      </div>

      {item.type === "urgent" ? (
        <span className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700">
          URGENTLY
        </span>
      ) : (
        <div className="flex gap-2">
          <button className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            승인
          </button>
          <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
            보류
          </button>
        </div>
      )}
    </div>
  );
}

export default TransferRequestCard;