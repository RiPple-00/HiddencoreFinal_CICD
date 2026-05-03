import api from "./index";

const visitApi = {
  /** 면회 신청 — DB에 저장 */
  createVisit: (body) => api.post("/api/guardian-visits", body),

  getAvailableTimes: (date) =>
    api.get("/api/guardian-visits/available-times", {
      params: { date },
    }),
};

export default visitApi;
