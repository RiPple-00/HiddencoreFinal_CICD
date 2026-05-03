/** 로그인 사용자·localStorage user 기준 시설 ID (엑셀 저장·식단 조회를 같은 시설로 맞춤) */
export function resolveFacilityId(user) {
  // JWT에서 facilityId 추출 시도
  const token = user?.accessToken ?? user?.token;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const n = Number(payload.facilityId);
      if (Number.isFinite(n) && n > 0) return n;
    } catch {}
  }
  // fallback: user 객체에서 직접 찾기
  const raw = user?.facilityId ?? user?.facility_id;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return n;
  return null; // 기본값 1 대신 null 반환 -> null check 후 토큰 확인에 사용
}

/** API 한 줄(row)에서 끼니 구분값을 통일 (대소문자·스네이크 케이스 허용) */
export function normalizeMealType(row) {
  const raw = row?.mealType ?? row?.meal_type ?? "";
  return String(raw).trim().toUpperCase();
}

export function normalizeDietType(row) {
  const raw = row?.dietType ?? row?.diet_type ?? "";
  return String(raw).trim().toUpperCase();
}

/** YYYY-MM-DD / YYYY.M.D / YYYY.MM.DD 등 → YYYY-MM-DD (쿼리·표시 통일) */
export function toIsoDateKey(value) {
  if (value == null || value === "") return "";
  const s = String(value).trim().replace(/\./g, "-");
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return s;
  const y = m[1];
  const mo = String(Number(m[2])).padStart(2, "0");
  const d = String(Number(m[3])).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

/** axios 본문이 배열이 아닐 때 대비 */
export function normalizeMealListResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

const SLOTS = ["BREAKFAST", "LUNCH", "DINNER"];

function emptySlot(mealType) {
  return { menu: "", mealType, calorie: null, protein: null };
}

function rowToSlot(row, mealType) {
  return {
    menu: row.menu ?? "",
    mealType,
    calorie: row.calorie ?? null,
    protein: row.protein ?? null,
  };
}

/**
 * 같은 날·같은 끼니에 여러 diet_type이 있으면 GENERAL 우선.
 */
export function mapMealRowsToSlots(rows) {
  const bySlot = { BREAKFAST: [], LUNCH: [], DINNER: [] };
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const mt = normalizeMealType(row);
    if (bySlot[mt]) bySlot[mt].push(row);
  });

  const mealMap = {
    breakfast: emptySlot("BREAKFAST"),
    lunch: emptySlot("LUNCH"),
    dinner: emptySlot("DINNER"),
  };

  SLOTS.forEach((slot) => {
    const key = slot === "BREAKFAST" ? "breakfast" : slot === "LUNCH" ? "lunch" : "dinner";
    const candidates = bySlot[slot];
    if (candidates.length === 0) return;
    const general = candidates.find((r) => normalizeDietType(r) === "GENERAL");
    const chosen = general ?? candidates[0];
    mealMap[key] = rowToSlot(chosen, slot);
  });

  return mealMap;
}

export const MEAL_TYPE_ORDER = { BREAKFAST: 0, LUNCH: 1, DINNER: 2 };
