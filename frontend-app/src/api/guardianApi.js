import api, { getAccessToken } from "./index";

function parseFacilityIdFromToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    const v = payload.facilityId ?? payload.facility_id;
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// 공지사항
export const getNotices = () => api.get("/api/notices");

// 식단
export const getMeals = () => api.get("/api/meals");

// 환자 정보
export const getPatient = () => api.get("/api/patient");

/** 원무과 웹에서 등록한 type=APPLY 프로그램 게시글 — JWT의 시설과 동일한 facility 기준 */
export const getPrograms = async () => {
  const token = await getAccessToken();
  const fromJwt = parseFacilityIdFromToken(token);
  /** 보호자 JWT는 facilityId가 0일 수 있음(JwtService) — 데모/단일 시설은 2로 조회 */
  const facilityId = fromJwt != null && fromJwt > 0 ? fromJwt : 2;
  const res = await api.get(`/api/facilities/${facilityId}/posts`, {
    params: { type: "APPLY", page: 0, size: 100 },
  });
  const raw = Array.isArray(res.data) ? res.data : [];
  const data = raw.filter((p) => p.status === "ACTIVE" || p.status === "RESERVE");
  return { ...res, data };
};

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
