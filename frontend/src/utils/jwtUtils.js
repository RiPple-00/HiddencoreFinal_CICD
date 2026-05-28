/** JWT payload에서 시설 ID (0·없음은 null) */
export function getFacilityIdFromToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const payload = JSON.parse(atob(base64));
    const n = Number(payload?.facilityId);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/** 로그인 user 객체 + JWT에서 시설 ID */
export function resolveStaffFacilityId(user) {
  if (user?.facilityId != null) {
    const n = Number(user.facilityId);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const token = user?.accessToken ?? user?.token;
  return getFacilityIdFromToken(token);
}
