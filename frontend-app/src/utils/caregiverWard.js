/** 병실 번호에서 '호' 제거 */
export function normalizeRoom(room) {
  if (room == null || room === "") return "";
  return String(room).replace(/호$/u, "").trim();
}

/** 101~599 형식이면 첫 자리를 층으로 추정 (107 → 1층) */
export function inferFloorFromRoom(room) {
  const r = normalizeRoom(room);
  if (/^[1-5]\d{2}$/.test(r)) return parseInt(r.charAt(0), 10);
  return null;
}

/** 담당 환자 목록에서 요양사가 맡은 병실(동·층·호) 결정 */
export function resolveCaregiverWard(patients, caregiverUserId) {
  let mine = (patients ?? []).filter(
    (p) =>
      caregiverUserId != null &&
      p.primaryCaregiverUserId != null &&
      Number(p.primaryCaregiverUserId) === Number(caregiverUserId) &&
      p.room
  );

  // DB에 담당 ID가 없을 때: 107호 환자를 담당 병실로 사용 (기만경 시연 데이터)
  if (mine.length === 0) {
    const in107 = (patients ?? []).filter(
      (p) => normalizeRoom(p.room) === "107"
    );
    if (in107.length > 0) mine = in107;
  }

  if (mine.length === 0) {
    return { myPatients: [], room: null, building: null, floor: null };
  }

  const keyCount = new Map();
  for (const p of mine) {
    const room = normalizeRoom(p.room);
    const building = p.building ?? "";
    const key = `${building}|${room}`;
    keyCount.set(key, (keyCount.get(key) ?? 0) + 1);
  }

  let bestKey = null;
  let bestCount = 0;
  for (const [key, count] of keyCount) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }

  const [building, room] = (bestKey ?? "|").split("|");
  const sample = mine.find(
    (p) => normalizeRoom(p.room) === room && (p.building ?? "") === building
  );

  return {
    myPatients: mine.filter(
      (p) => normalizeRoom(p.room) === room && (p.building ?? "") === building
    ),
    room,
    building: building || sample?.building || null,
    floor: sample?.floor ?? inferFloorFromRoom(room),
  };
}

export function mapBedFromApi(bed) {
  return {
    locationId: bed.locationId,
    patientId: bed.patientId,
    bedLabel: bed.bedId ?? "-",
    patientName: bed.name,
    gender: bed.gender,
    age: bed.age,
    status: bed.status,
    occupied: Boolean(bed.occupied),
    mealType: bed.type ?? "일반식",
    dietType: bed.type,
  };
}

export function isCriticalStatus(statusText) {
  const s = String(statusText ?? "");
  return s.includes("위험") || s.toUpperCase().includes("CRITICAL");
}
