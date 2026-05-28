import api from "../index";
import { resolveFacilityId } from "../../utils/facilityId";

/**
 * 원무과 웹에서 등록한 type=APPLY 프로그램 게시글 — JWT 시설 기준
 * @returns {Promise<{ data: unknown[] } & import("axios").AxiosResponse>}
 */
export const getGuardianProgramList = async () => {
  const facilityId = await resolveFacilityId();
  const res = await api.get(`/api/facilities/${facilityId}/posts`, {
    params: { type: "APPLY", page: 0, size: 100 },
  });
  const raw = Array.isArray(res.data) ? res.data : [];
  const data = raw.filter((p) => p.status === "ACTIVE");
  return { ...res, data };
};
