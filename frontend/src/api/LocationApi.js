import api from './index';

export const getRoomSummary = async ({ building, floor }) => {
  const response = await api.get('/locations/rooms/summary', {
    params: { building, floor },
  });
  return response.data;
};

export const getRoomPatientCount = async ({ building, floor, room }) => {
  const response = await api.get('/locations/room/count', {
    params: { building, floor, room },
  });
  return response.data;
};

export const getAllBeds = async (facilityId) => {
  const response = await api.get('/locations/all', { params: { facilityId } });
  return response.data;
};