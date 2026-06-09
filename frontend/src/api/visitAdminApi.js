import api from "./index";

const visitAdminApi = {
  getVisitRequests: () => api.get("/guardian-visits/admin"),

  approveVisitRequest: (visitRequestId) =>
    api.patch(`/guardian-visits/admin/${visitRequestId}/approve`),

  rejectVisitRequest: (visitRequestId, reason) =>
    api.patch(`/guardian-visits/admin/${visitRequestId}/reject`, { reason }),
};

export default visitAdminApi;