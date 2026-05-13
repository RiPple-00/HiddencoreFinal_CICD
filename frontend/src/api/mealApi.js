import api from './index';

/** 식단 API — 조회 시 `facilityId`가 있으면 쿼리에 넣어 업로드(저장)와 같은 시설 기준으로 맞춤 */
export default {
  bulkUpsertMeals: (data) => api.post('/meals/bulk', data),
  getMealsByDate: (date, facilityId) =>
    api.get('/meals/by-date', {
      params: {
        date,
        ...(facilityId != null && facilityId !== '' ? { facilityId } : {}),
      },
    }),
  getMealsByRange: (startDate, endDate, facilityId) =>
    api.get('/meals/by-range', {
      params: {
        startDate,
        endDate,
        ...(facilityId != null && facilityId !== '' ? { facilityId } : {}),
      },
    }),
};
