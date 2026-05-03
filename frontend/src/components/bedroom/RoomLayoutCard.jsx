import BedCard from "./BedCard";
import WardLayoutCard from "./WardLayoutCard";


function RoomLayoutCard({ beds, onAssignClick, onBedClick}) {

  
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">
          병상 배치도 (Room Layout)
        </h2>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
         
          <div>
            <span className="font-semibold">병실 유형</span> 여성 병동
          </div>
          <div>
            <span className="font-semibold">병상 수</span> {beds[0]?.roomCapacity || 0}개
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-slate-100 py-5 text-center text-lg font-semibold tracking-widest text-slate-500">
        창문 (WINDOW)
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {beds.map((bed) => (
          <BedCard key={bed.id} bed={bed} 
            onAssignClick={onAssignClick}
            onBedClick = {onBedClick} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-100 py-5 text-center text-lg font-semibold tracking-widest text-slate-500">
        출입문 (DOOR)
      </div>
    </section>
    
  );
}

export default RoomLayoutCard;