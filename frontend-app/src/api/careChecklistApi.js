import api from "./index";

export function fetchGuardianLinkedPatients() {
  return api.get("/api/guardian/me/linked-patients");
}

/** 보호자 실시간: 요양사 CARE_CHECK(자동 저장·제출) 본문 — 오늘 날짜 기준 */
export function fetchGuardianCareCheck(patientId, date) {
  return api.get(`/api/guardian/me/patients/${patientId}/care-check`, {
    params: date ? { date } : {},
  });
}

export function fetchCaregiverPatients() {
  return api.get("/api/caregiver/patients");
}
