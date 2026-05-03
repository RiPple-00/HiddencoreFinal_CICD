import api from "./index";

const patientApi = {
  getPatients: (params) => {
    return api.get(`/patients`, { params });
  },

  getPatientById: (patientId) => {
    return api.get(`/patients/${patientId}`);
  },

  createPatient: (patientData) => {
    const body = { ...patientData };
    if (body.gender === "" || body.gender == null) {
      delete body.gender;
    }
    return api.post(`/patients`, body);
  },

  updatePatient: (patientId, patientData) => {
    const body = { ...patientData };
    if (body.gender === "") {
      body.gender = null;
    }
    return api.put(`/patients/${patientId}`, body);
  },

  deletePatient: (patientId) => {
    return api.delete(`/patients/${patientId}`);
  },
};

export default patientApi;
