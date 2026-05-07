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