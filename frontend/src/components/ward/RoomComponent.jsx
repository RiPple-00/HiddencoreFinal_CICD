import React from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLE = {
  FULL: {
    line: 'border-l-red-600',
    badge: 'bg-red-100 text-red-600',
    progress: 'bg-red-600',
  },
  STABLE: {
    line: 'border-l-emerald-600',
    badge: 'bg-emerald-100 text-emerald-600',
    progress: 'bg-emerald-600',
  },
};

function RoomComponent({ room, isDimmed = false, building }) {
  const navigate = useNavigate();
  const statusStyle = STATUS_STYLE[room.status] || STATUS_STYLE.STABLE;
  const occupiedRatio = Math.min(100, (room.patientCount / room.roomCapacity) * 100);
  const availableBeds = Math.max(0, room.roomCapacity - room.patientCount);

  const handleClick = () => {
    const id = String(room.roomNumber ?? room.id ?? '').trim();
    if (!id) return;
    const b = building != null ? String(building).trim() : '';
    const qs = b ? `?building=${encodeURIComponent(b)}` : '';
    navigate(`/bedroompage/${encodeURIComponent(id)}${qs}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex aspect-square w-full flex-col overflow-hidden rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm transition ${isDimmed ? 'grayscale opacity-45' : ''} ${statusStyle.line}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-3xl font-extrabold leading-none text-gray-800 whitespace-nowrap">{room.roomNumber}호</p>
        <div className="flex flex-nowrap items-center gap-2">
          <span className={`rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap ${statusStyle.badge}`}>
            {room.status}
          </span>
        </div>
      </div>

      <div className="mb-2 flex justify-end">
        <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 whitespace-nowrap">
          {room.roomType}
        </span>
      </div>

      <p className="mt-6 mb-3 text-sm text-gray-600">
        성별: {room.gender}{' '}
        <span className="ml-2 font-semibold text-emerald-700">
          {room.patientCount}/{room.roomCapacity} Beds
        </span>
      </p>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${statusStyle.progress}`} style={{ width: `${occupiedRatio}%` }} />
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex gap-1.5">
          {(room.nurses || []).map((nurse) => (
            <span
              key={nurse}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600"
            >
              {nurse}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500">{availableBeds} Available</p>
      </div>
    </button>
  );
}

export default RoomComponent;