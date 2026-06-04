import api from "./index";

/** 병실별 병상 배치 (원무과 병상 화면과 동일 API) */
const bedRoomApi = {
  getBedsByRoom: (room, building, floor) =>
    api.get(`/api/rooms/${encodeURIComponent(room)}/beds`, {
      params: {
        ...(building ? { building } : {}),
        ...(floor != null ? { floor } : {}),
      },
    }),
};

export default bedRoomApi;
