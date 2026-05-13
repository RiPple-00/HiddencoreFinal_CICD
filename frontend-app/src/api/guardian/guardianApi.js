import api from "../index";

// 공지사항
export const getNotices = () => api.get("/api/notices");

// 식단
export const getMeals = () => api.get("/api/meals");

// 환자 정보
export const getPatient = () => api.get("/api/patient");

export { getGuardianProgramList as getPrograms } from "./programListApi";
export {
  applyGuardianProgram as applyProgram,
  getGuardianProgramApplications as getProgramApplications,
  cancelGuardianProgramApplication as cancelProgramApplication,
} from "./programApplicationApi";

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
