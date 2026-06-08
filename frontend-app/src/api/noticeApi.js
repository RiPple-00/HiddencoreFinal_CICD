import api from "./index";
import { resolveFacilityId } from "../utils/facilityId";

/**
 * 공지사항 목록 — GET /api/facilities/{facilityId}/posts
 * 백엔드 PostListResponse 페이지네이션: { content: [], totalElements, ... }
 * 또는 배열 직접 반환 — 양쪽 모두 처리
 */
export async function getCaregiverNotices(facilityId, size = 5) {
  const fid = facilityId ?? (await resolveFacilityId());
  return api.get(`/api/facilities/${fid}/posts`, {
    params: { page: 0, size },
  });
}

export async function getCaregiverNoticeDetail(postId, facilityId) {
  const fid = facilityId ?? (await resolveFacilityId());
  return api.get(`/api/facilities/${fid}/posts/${postId}`);
}
