import { genderCodeToLabel } from "../../utils/genderDisplay";

function BedCard({ bed, onAssignClick, onBedClick }) {
  if (!bed.occupied) {
    return (
      // 비어 있는 침상 카드를 클릭할때 검색창 
      <button
        type="button"
        onClick={() => onAssignClick?.(bed)}
        className="flex min-h-[210px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
      >
        <div className="mb-2 text-5xl">+</div>
        <p className="text-sm font-semibold">침상 {bed.id}</p>
        <p className="text-base font-bold">환자 배정</p>
      </button>
    );
  }

  else {
    return (
    <div className="min-h-[210px] rounded-3xl border-2 border-blue-600 bg-white p-5 shadow-sm cusror-pointer"
      onClick={()=> onBedClick?.(bed)}>
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-bold text-blue-700">침상 {bed.id}</p>
        <span
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
            bed.status === "정상" || bed.status === "안정"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {bed.status}
        </span>
      </div>

      <div className="mb-5">
        <h3 className="text-3xl font-bold text-slate-900">{bed.patientName}</h3>
        <p className="mt-1 text-base text-slate-500">
          {genderCodeToLabel(bed.gender)} / {bed.age ?? "-"}세
        </p>
      </div>

      { bed.bloodType && ( //환자가 있냐를 bed.bloodType으로 판단
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-400">혈액형</p>
            <p className="text-xl font-bold text-blue-700">{bed.bloodType}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-400">입원 날짜</p>
            <p className="text-xl font-bold text-blue-700">{bed.admissionDate}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-400">생년월일</p>
            <p className="text-xl font-bold text-blue-700">{bed.birthDate}</p>
          </div>
           
        </div>
      )}

    </div>
  );
}
}

export default BedCard;