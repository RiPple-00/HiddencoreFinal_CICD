import api from "./axiosInstance";

export const getAdminPatientDetail = async (patientId) => {
  const res = await api.get(`/admin/patients/${patientId}`);
  return res.data;
};