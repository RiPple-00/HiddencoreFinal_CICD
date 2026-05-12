import { useEffect, useMemo, useState } from 'react';
import { getRoomSummary } from '../api/LocationApi';
import RoomComponent from '../components/ward/RoomComponent';
import TopNavBar from "../components/bedroom/TopNavBar";
import GuardianPanel from "../components/bedroom/GuardianPanel";
import AdminMenuPanel from "../components/bedroom/AdminMenuPanel";
//import VisitorsPanel from "../components/bedroom/VisitorsPanel";
import MealCarePage from "./MealCarePage";
import { useAuth } from '../contexts/AutoContext.jsx';
import PostList from '../components/board/PostList';
import postApi from '@/api/postApi';
// import WardLayoutCard from '../components/bedroom/WardLayoutCard';
const WARDS = [
  { value: 'A동', label: 'A동' },
  { value: 'B동', label: 'B동' },
  { value: 'C동', label: 'C동' },
];
const FLOORS = [1, 2, 3, 4, 5];
const SPECIALS = ['중환자실', '격리실'];
const ROOMS_PER_PAGE = 10;

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
  return 'STABLE';
};

const isRoomHighlighted = (roomType, selectedSpecial) => {
  if (!selectedSpecial) return roomType === '일반실';
  return roomType === selectedSpecial;
};

function HomePage() {
  const [selectedWard, setSelectedWard] = useState('A동');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSpecial, setSelectedSpecial] = useState(null);
  const [roomCounts, setRoomCounts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();
  const token = user?.accessToken ?? user?.token;
  const jwtPayload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const facilityId = jwtPayload.facilityId ?? null;

  const [noticePosts, setNoticePosts] = useState([]);
  const [schedulePosts, setSchedulePosts] = useState([]);

  useEffect(() => {
    if (!facilityId) return;
    // 공지사항
    postApi.getPostList(facilityId, null, 0, 5)
      .then(res => setNoticePosts(res.data ?? []));
    // 프로그램 및 시설 일정 (APPLY + REVIEW + FACILITY)
    postApi.getPostList(facilityId, 'APPLY', 0, 5)
      .then(res => setSchedulePosts(res.data ?? []));
  }, [facilityId]);

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
          };
        });

        setRoomCounts(counts);
        setCurrentPage(1); // 병동/층 바꾸면 1페이지로 초기화
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
        gender,
        patientCount,
        roomCapacity,
        status: getStatus(patientCount, roomCapacity),
        roomType,
        nurses: [],
      };
    });
  }, [roomCounts]);

  const totalPages = Math.ceil(roomData.length / ROOMS_PER_PAGE);
  const pagedRooms = roomData.slice((currentPage - 1) * ROOMS_PER_PAGE, currentPage * ROOMS_PER_PAGE);
  const topRooms = pagedRooms.slice(0, 5);
  const bottomRooms = pagedRooms.slice(5, 10);

  return (
    <>
      <TopNavBar activeNav="rooms" />
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1680px] items-start gap-8 px-8 py-6">
          <main className="min-w-0 flex-1 space-y-6">
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
                    isDimmed={!isRoomHighlighted(room.roomType, selectedSpecial)}
                  />
                ))}
              </div>

              <div className="my-5 flex h-28 items-center justify-center rounded-xl border border-blue-200 bg-gray-200 text-2xl font-bold tracking-widest text-slate-500">
                복도(HALL)
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {bottomRooms.map((room) => (
                  <RoomComponent
                    key={room.id}
                    room={room}
                    isDimmed={!isRoomHighlighted(room.roomType, selectedSpecial)}
                  />
                ))}
              </div>


              {/* 페이지네이션 */}
              <div className="mt-5 flex items-center justify-center gap-3 text-xl font-semibold text-gray-500">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`${page === currentPage ? 'text-blue-600' : 'hover:text-gray-800'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>

            {/* 공지사항 + 프로그램 및 시설 일정 (가로 배치) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">프로그램 및 시설 일정</h3>
                  <a href={`/facilities/${facilityId}/board`} className="text-xs text-teal-600 hover:underline">
                    전체보기
                  </a>
                </div>
                <PostList posts={schedulePosts.slice(0, 5)} mode="widget" facilityId={facilityId} />
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">공지사항</h3>
                  <a href={`/facilities/${facilityId}/board`} className="text-xs text-teal-600 hover:underline">
                    전체보기
                  </a>
                </div>
                <PostList posts={noticePosts.slice(0, 5)} mode="widget" facilityId={facilityId} />
              </div>
            </div>
          </main>

          <aside className="w-[360px] shrink-0 space-y-6 self-start lg:sticky lg:top-6">
            <GuardianPanel />
            <AdminMenuPanel />
            <VisitorsPanel />
            <MealCarePage />
          </aside>
        </div>
      </div>

    </>
  );
}

export default HomePage;