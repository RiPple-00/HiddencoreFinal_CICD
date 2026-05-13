import api from "./index";

/**
 * 간병인 일일 업무 체크리스트 API.
 *
 * 백엔드 컨트롤러: /api/caregiver/care-checks
 *  - POST /auto-save : 자동 저장(임시저장 갱신)
 *  - POST /submit    : 제출(승인 대기 상태로 승격)
 *  - GET  ?patientId=&date=  : 단건 조회(없으면 빈 응답)
 *  - GET  /history?patientId : 환자별 이력
 */
const caregiverApi = {
  /**
   * 자동 저장. payload 예시:
   * {
   *   patientId: 1,
   *   recordDate: "2026-05-11",
   *   content: { meal:{}, hygiene:{}, condition:{}, elimination:{}, specialNotes:"..." }
   * }
   */
  autoSave: (payload) =>
    api.post("/api/caregiver/care-checks/auto-save", payload),

  /** 제출하기 - autoSave 와 동일한 본문 사용 */
  submit: (payload) =>
    api.post("/api/caregiver/care-checks/submit", payload),

  /** 단건 조회 */
  getOne: ({ patientId, date }) =>
    api.get("/api/caregiver/care-checks", {
      params: {
        patientId,
        ...(date ? { date } : {}),
      },
    }),

  /** 환자별 이력 목록 */
  getHistory: ({ patientId }) =>
    api.get("/api/caregiver/care-checks/history", {
      params: { patientId },
    }),
};

export default caregiverApi;
