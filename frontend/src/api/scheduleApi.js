import api from "./axiosInstance";

// 달력 관련 API

const pad2 = (n) => String(n).padStart(2, "0");
// LocalDateTime 파라미터는 timezone(Z) 없이 보내야 안전함
const toLocalDateTimeParam = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}T00:00:00`;
};

// 일정 조회
export const getSchedules = async (facilityId, startDate, endDate) => {
  try {
    // 백엔드: GET /api/schedules/month?facilityId=...&date=...
    const referenceDate = startDate ? toLocalDateTimeParam(startDate) : toLocalDateTimeParam(new Date());
    const response = await api.get(`/schedules/month`, {
      params: {
        facilityId,
        date: referenceDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error("일정 조회 실패:", error);
    throw error;
  }
};

// 오늘 일정 조회
export const getTodaySchedules = async (facilityId) => {
    try {
        const response = await api.get(`/schedules/today`, { params: { facilityId } });
        return response.data;
    } catch (error) {
        console.error("오늘 일정 조회 실패:", error);
        throw error;
    }
};

// 일정 생성
export const createSchedule = async (facilityId, scheduleData) => {
  try {
    // 백엔드: POST /api/schedules/personal
    const response = await api.post(`/schedules/personal`, {
      facilityId,
      ...scheduleData,
    });
    return response.data;
  } catch (error) {
    console.error("일정 생성 실패:", error);
    throw error;
  }
};

// SchedulePage 에서 사용하는 이름과 맞추기 위한 alias
export const createPersonalSchedule = async (scheduleData) => {
  // 백엔드 DTO(ScheduleCreateRequest) 그대로 전달
  const response = await api.post(`/schedules/personal`, scheduleData);
  return response.data;
};

// 일정 수정
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await api.put(`/schedules/personal/${scheduleId}`, scheduleData);
    return response.data;
  } catch (error) {
    console.error("일정 수정 실패:", error);
    throw error;
  }
};

// 일정 삭제
export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await api.delete(`/schedules/personal/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error("일정 삭제 실패:", error);
    throw error;
  }
};

// 일정 상세 조회
export const getScheduleDetail = async (scheduleId) => {
  try {
    const response = await api.get(`/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error("일정 상세 조회 실패:", error);
    throw error;
  }
};

// 월별 일정 조회 (달력 페이지용)
export const getScheduleList = async (facilityId, year, month, filter = "ALL") => {
  const referenceDate = `${year}-${pad2(month)}-01T00:00:00`;

  const response = await api.get("/schedules/month", {
    params: {
      facilityId,
      date: referenceDate,
      filter,
    },
  });

  return response.data;
};

const scheduleApi = {
  getSchedules,
  getTodaySchedules,
  createSchedule,
  createPersonalSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleDetail,
};

// Create Schedule on Post
export const createFacilitySchedule = async (scheduleData) => {
  const response = await api.post('/schedules/facility', scheduleData);
  return response.data;
};

export default scheduleApi;