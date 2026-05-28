import { useEffect, useMemo, useState } from 'react';
import { getRoomSummary } from '../../api/LocationApi';
import RoomComponent from '../ward/RoomComponent';

const WARDS = [
  { value: 'A동', label: 'A동' },
  { value: 'B동', label: 'B동' },
  { value: 'C동', label: 'C동' },
];
const FLOORS = [1, 2, 3, 4, 5];
const SPECIALS = ['중환자실', '격리실'];

const ROOM_TYPE_MAP = {
  GENERAL: '일반실',
  ICU: '중환자실',
  ISOLATION: '격리실',
};

const GENDER_MAP = {
  MALE: '남성',
  FEMALE: '여성',
  CONCOCTION: '혼합',
};

const btnBaseClass = 'rounded-lg px-4 py-2 text-sm font-medium transition';
const btnActiveClass = 'bg-blue-600 text-white';
const btnInactiveClass = 'bg-white text-gray-800 hover:bg-blue-50';

const getStatus = (patientCount, roomCapacity) => {
  if (patientCount >= roomCapacity) return 'FULL';
  return 'AVAILABLE';
};

const isRoomHighlighted = (roomType, selectedSpecial) => {
  if (!selectedSpecial) return roomType === '일반실';
  return roomType === selectedSpecial;
};

function WardLayoutCard() {
  const [selectedWard, setSelectedWard] = useState('A동');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSpecial, setSelectedSpecial] = useState(null);
  const [roomCounts, setRoomCounts] = useState({});

  useEffect(() => {
    const fetchRoomSummary = async () => {
      try {
        const summary = await getRoomSummary({
          building: selectedWard,
          floor: selectedFloor,
        });

        const counts = {};
        summary.forEach((item) => {
          const roomKey = `${item.room}`;
          counts[roomKey] = {
            patientCount: item.patientCount ?? 0,
            roomCapacity: item.roomCapacity ?? 4,
            roomType: item.roomType,
            roomGenderType: item.roomGenderType,
            floor: item.floor,
          };
        });

        setRoomCounts(counts);
      } catch (error) {
        console.error('병실 환자 수 조회 실패:', error);
        setRoomCounts({});
      }
    };

    fetchRoomSummary();
  }, [selectedWard, selectedFloor]);

  const roomData = useMemo(() => {
    return Object.entries(roomCounts).map(([roomKey, data]) => {
      const patientCount = data.patientCount ?? 0;
      const roomCapacity = data.roomCapacity ?? 4;
      const roomType = ROOM_TYPE_MAP[data.roomType] ?? '일반실';
      const gender = GENDER_MAP[data.roomGenderType] ?? '혼합';

      return {
        id: roomKey,
        roomNumber: roomKey,
        floor: data.floor,
        gender,
        patientCount,
        roomCapacity,
        status: getStatus(patientCount, roomCapacity),
        roomType,
        nurses: [],
      };
    });
  }, [roomCounts]);

  const topRooms = roomData.slice(0, 5);
  const bottomRooms = roomData.slice(5, 10);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gray-300 p-6">
        <div className="flex flex-wrap gap-10">
          <div>
            <p className="mb-4 text-lg text-blue-600">WARD SELECTION</p>
            <div className="flex gap-3">
              {WARDS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedWard(value)}
                  className={`${btnBaseClass} ${selectedWard === value ? btnActiveClass : btnInactiveClass}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-lg text-blue-600">FLOOR SELECTION</p>
            <div className="flex gap-2">
              {FLOORS.map((floor) => (
                <button
                  key={floor}
                  type="button"
                  onClick={() => setSelectedFloor(floor)}
                  className={`${btnBaseClass} rounded ${selectedFloor === floor ? btnActiveClass : btnInactiveClass}`}
                >
                  {floor}F
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-lg text-blue-600">SPECIAL SELECTION</p>
            <div className="flex gap-2">
              {SPECIALS.map((special) => (
                <button
                  key={special}
                  type="button"
                  onClick={() =>
                    setSelectedSpecial((prev) => (prev === special ? null : special))
                  }
                  className={`${btnBaseClass} ${selectedSpecial === special ? btnActiveClass : btnInactiveClass}`}
                >
                  {special}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {topRooms.map((room) => (
            <RoomComponent
              key={room.id}
              room={room}
              building={selectedWard}
              isDimmed={!isRoomHighlighted(room.roomType, selectedSpecial)}
            />
          ))}
        </div>

        <div className="my-6 h-px w-full bg-slate-300" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {bottomRooms.map((room) => (
            <RoomComponent
              key={room.id}
              room={room}
              building={selectedWard}
              isDimmed={!isRoomHighlighted(room.roomType, selectedSpecial)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default WardLayoutCard;