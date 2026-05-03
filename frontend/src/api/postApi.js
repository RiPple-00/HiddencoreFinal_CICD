import api from './index';

const postApi = {
  getPostList: (facilityId, type = null, page = 0, size = 20) =>
    api.get(`/facilities/${facilityId}/posts`, {
      params: { type, page, size },
    }),

  getPost: (facilityId, postId) =>
    api.get(`/facilities/${facilityId}/posts/${postId}`),

  searchPosts: (facilityId, type, searchType, keyword, page = 0, size = 20) =>
    api.get(`/facilities/${facilityId}/posts/search`, {
      params: { type, searchType, keyword, page, size },
    }),

  createPost: (facilityId, data) =>
    api.post(`/facilities/${facilityId}/posts`, data),

  updatePost: (facilityId, postId, data) =>
    api.put(`/facilities/${facilityId}/posts/${postId}`, data),

  deletePost: (facilityId, postId) =>
    api.delete(`/facilities/${facilityId}/posts/${postId}`),

  getMyPosts: (facilityId, type = null, page = 0, size = 20) =>
    api.get(`/facilities/${facilityId}/posts/my`, {
      params: { page, size, ...(type != null ? { type } : {}) },
    }),

  getMyDrafts: (facilityId, type = null, page = 0, size = 20) =>
    api.get(`/facilities/${facilityId}/posts/draft`, {
      params: { page, size, ...(type != null ? { type } : {}) },
    }),

  uploadFile: (facilityId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/facilities/${facilityId}/posts/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default postApi;
