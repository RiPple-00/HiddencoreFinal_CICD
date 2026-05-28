import { getAccessToken, decodeJwtPayload } from "../api/index";

/** 데모 시설(시설코드 12345678) — JWT·연결 환자 없을 때 최후 fallback */
const DEMO_FACILITY_ID = 2;

let cachedFacilityId = null;

export function parseFacilityIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const v = payload.facilityId ?? payload.facility_id;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * 보호자·요양사 API용 시설 ID
 * 1) JWT facilityId 2) 로그인 응답 캐시 3) 데모 시설
 */
export async function resolveFacilityId() {
  if (cachedFacilityId != null && cachedFacilityId > 0) {
    return cachedFacilityId;
  }

  const token = await getAccessToken();
  const fromJwt = parseFacilityIdFromToken(token);
  if (fromJwt != null) {
    cachedFacilityId = fromJwt;
    return fromJwt;
  }

  cachedFacilityId = DEMO_FACILITY_ID;
  return DEMO_FACILITY_ID;
}

export function setCachedFacilityId(id) {
  const n = Number(id);
  if (Number.isFinite(n) && n > 0) {
    cachedFacilityId = n;
  }
}

export function clearCachedFacilityId() {
  cachedFacilityId = null;
}

/** 로그인 직후 facilityId를 응답·JWT에서 반영 */
export function applyFacilityIdFromLogin(accessToken, facilityIdFromBody) {
  const fromBody = Number(facilityIdFromBody);
  if (Number.isFinite(fromBody) && fromBody > 0) {
    setCachedFacilityId(fromBody);
    return fromBody;
  }
  const fromJwt = parseFacilityIdFromToken(accessToken);
  if (fromJwt != null) {
    setCachedFacilityId(fromJwt);
    return fromJwt;
  }
  return null;
}
