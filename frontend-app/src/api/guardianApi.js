import api from "./index";

// 공지사항
export const getNotices = () => api.get("/api/notices");

// 식단
export const getMeals = () => api.get("/api/meals");

// 환자 정보
export const getPatient = () => api.get("/api/patient");

// 프로그램 목록 조회
export const getPrograms = () =>
  api.get("/api/facilities/2/posts?type=APPLY"); //강제로 부여한 시설 ID 2 

// 프로그램 신청
export const applyProgram = (postId) =>
  api.post(`/api/guardian/programs/${postId}/apply`);

// 내 프로그램 신청내역 조회
export const getProgramApplications = () =>
  api.get("/api/guardian/programs/applications");

// 프로그램 신청 취소
export const cancelProgramApplication = (documentId) =>
  api.delete(`/api/guardian/programs/applications/${documentId}`);

// 보호자 게시판 전체 목록 조회
export const getGuardianPosts = (facilityId = 2) =>
  api.get(`/api/facilities/${facilityId}/posts`, {
    params: { page: 0, size: 9999 },
  });

// 보호자 게시글 상세 조회
export const getGuardianPost = (postId, facilityId = 2) =>
  api.get(`/api/facilities/${facilityId}/posts/${postId}`);

// 보호자 자유게시판 글 작성
export const createGuardianFreePost = (data, facilityId = 2) =>
  api.post(`/api/facilities/${facilityId}/posts`, data);