import api from "./index";

export function uploadCaregiverActivityPhoto(formData) {
  return api.post("/api/caregiver/activity-photos", formData, {
    timeout: 120000,
  });
}

export function fetchGuardianActivityGallery(patientId) {
  return api.get(`/api/guardian/me/patients/${patientId}/activity-gallery`);
}
