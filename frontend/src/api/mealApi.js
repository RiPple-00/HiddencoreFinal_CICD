import api from './index';

/** 조회는 시설 파라미터 없이 전체 일자 기준 (저장 날짜와 조회 불일치 방지) */
export default {
  bulkUpsertMeals: (data) => api.post('/meals/bulk', data),
  getMealsByDate: (date, facilityId) =>
    api.get('/meals/by-date', {
      params: { date, facilityId },
    }),
  getMealsByRange: (startDate, endDate, facilityId) =>
    api.get('/meals/by-range', {
      params: { startDate, endDate, facilityId },
    }),
};
