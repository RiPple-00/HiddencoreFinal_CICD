import api from "./index";

export function fetchGuardianLinkedPatients() {
  return api.get("/api/guardian/me/linked-patients");
}

/** @returns axios response; 204면 data 없음 */
export function fetchGuardianLatestCareChecklist(patientId) {
  return api.get(`/api/guardian/me/patients/${patientId}/care-checklist/latest`);
}

export function fetchCaregiverPatients() {
  return api.get("/api/caregiver/patients");
}

export function fetchCaregiverLatestCareChecklist(patientId) {
  return api.get(`/api/caregiver/patients/${patientId}/care-checklist/latest`);
}

export function saveCaregiverCareChecklist(patientId, checklist) {
  return api.post(`/api/caregiver/patients/${patientId}/care-checklist`, { checklist });
}
