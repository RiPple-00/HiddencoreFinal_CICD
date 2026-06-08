import { useI18n } from "../../hooks/useI18n";
import BedCard from "./BedCard";

function RoomLayoutCard({ beds, roomGenderLabel, onAssignClick, onBedClick }) {
  const { t } = useI18n();

  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {t('room.layoutTitle')} (Room Layout)
        </h2>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
          <div>
            <span className="font-semibold">{t('room.type')}</span> {roomGenderLabel || "-"}
          </div>
          <div>
            <span className="font-semibold">{t('room.bedCount')}</span> {beds[0]?.roomCapacity || 0}{t('room.bedUnit')}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-slate-100 py-5 text-center text-lg font-semibold tracking-widest text-slate-500">
        {t('room.window')}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {beds.map((bed) => (
          <BedCard key={bed.id} bed={bed}
            onAssignClick={onAssignClick}
            onBedClick={onBedClick} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-100 py-5 text-center text-lg font-semibold tracking-widest text-slate-500">
        {t('room.door')}
      </div>
    </section>
  );
}

export default RoomLayoutCard;
