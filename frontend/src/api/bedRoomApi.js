import api from "./index";

const bedRoomApi = {

    //병상 배치도 불러오기
    getBedsByRoom: (room, building, floor) => {
        return api.get(`/rooms/${room}/beds`, {
            params: { building, floor }
        });
    },

    /** 입소자를 침상에 배정 (이미 등록된 입소자 → location 연결) */
    assignPatientToBed: (locationId, patientId) => {
        return api.put(`/rooms/beds/${locationId}/assign`, { patientId });
    },

    // 입소자 상세 정보 불러오기
    getPatientDetail: (patientId) => {
        // BedRoomPage is using patientApi.getPatientById; keep this as-is for other pages.
        return api.get(`/patients/${patientId}`);
    },

    // 병상 배정을 위한 입소자 검색 (/api/rooms/... 와 경로 충돌 방지)
    getSearchPatientsForAssign: (keyword) => {
        return api.get(`/patients/search`, {
            params: { keyword },
        });
    },

    getUnassignedPatientsForAssign: () => {
        return api.get(`/patients/unassigned`);
    },

    //병상 배정 입소자 삭제
    deletePatientFromBed: (locationId) => {
        return api.delete(`/rooms/beds/${locationId}/assign`);
    }

};





export default bedRoomApi;