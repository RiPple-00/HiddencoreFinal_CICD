import api, { getAccessToken } from "../index";

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

/**
 * 원무과 웹에서 등록한 type=APPLY 프로그램 게시글 — JWT 시설 기준
 * @returns {Promise<{ data: unknown[] } & import("axios").AxiosResponse>}
 */
export const getGuardianProgramList = async () => {
  const token = await getAccessToken();
  const fromJwt = parseFacilityIdFromToken(token);
  const facilityId = fromJwt != null && fromJwt > 0 ? fromJwt : 2;
  const res = await api.get(`/api/facilities/${facilityId}/posts`, {
    params: { type: "APPLY", page: 0, size: 100 },
  });
  const raw = Array.isArray(res.data) ? res.data : [];
  const data = raw.filter((p) => p.status === "ACTIVE");
  return { ...res, data };
};
