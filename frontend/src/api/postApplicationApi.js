import api from './index';

const postApplicationApi = {
  getApplications: (facilityId, postId) =>
    api.get(`/facilities/${facilityId}/posts/${postId}/applications`),

  updateApplicationStatus: (facilityId, postId, applicationId, status, memo = null) =>
    api.patch(`/facilities/${facilityId}/posts/${postId}/applications/${applicationId}`, {
      status,
      memo,
    }),
};

export default postApplicationApi;