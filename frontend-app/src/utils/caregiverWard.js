import {
  DEMO_GUARDIAN_PATIENT_ID,
  DEMO_GUARDIAN_PATIENT_NAME,
  resolveGuardianPatientDisplayName,
} from "./guardianPatientId";

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

/** 시설 환자 목록에서 기만경(시연 환자) 찾기 */
export function findDemoPatient(patients) {
  if (!Array.isArray(patients) || patients.length === 0) return null;
  const byId = patients.find((p) => Number(p.patientId) === DEMO_GUARDIAN_PATIENT_ID);
  if (byId) return byId;
  return (
    patients.find((p) => {
      const name = typeof p.name === "string" ? p.name.trim() : "";
      return name === DEMO_GUARDIAN_PATIENT_NAME;
    }) ?? null
  );
}

function patientsInSameRoom(patients, room, building) {
  const normalizedRoom = normalizeRoom(room);
  const normalizedBuilding = building ?? "";
  return (patients ?? []).filter(
    (p) =>
      normalizeRoom(p.room) === normalizedRoom &&
      (p.building ?? "") === normalizedBuilding
  );
}

function wardFromPatient(anchor, patients) {
  const room = normalizeRoom(anchor.room);
  if (!room) return null;
  const building = anchor.building ?? "";
  const floor =
    anchor.floor != null && anchor.floor !== ""
      ? Number(anchor.floor)
      : inferFloorFromRoom(room);
  const roommates = patientsInSameRoom(patients, room, building);
  return {
    myPatients: roommates.length > 0 ? roommates : [anchor],
    room,
    building: building || null,
    floor,
    anchorPatient: anchor,
  };
}

/**
 * 요양사 환자 목록 화면용 병실 결정.
 * 1) 기만경 환자의 원무과 침상 배정(동·층·호) 기준
 * 2) 없으면 로그인 요양사 담당 환자 병실
 */
export function resolveCaregiverWard(patients, caregiverUserId) {
  const list = patients ?? [];

  const demo = findDemoPatient(list);
  if (demo?.room) {
    const fromDemo = wardFromPatient(demo, list);
    if (fromDemo) return fromDemo;
  }

  let mine = list.filter(
    (p) =>
      caregiverUserId != null &&
      p.primaryCaregiverUserId != null &&
      Number(p.primaryCaregiverUserId) === Number(caregiverUserId) &&
      p.room
  );

  if (mine.length === 0) {
    return { myPatients: [], room: null, building: null, floor: null, anchorPatient: null };
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
  if (!sample) {
    return { myPatients: [], room: null, building: null, floor: null, anchorPatient: null };
  }

  return wardFromPatient(sample, list) ?? {
    myPatients: mine.filter(
      (p) => normalizeRoom(p.room) === room && (p.building ?? "") === building
    ),
    room,
    building: building || sample?.building || null,
    floor: sample?.floor ?? inferFloorFromRoom(room),
    anchorPatient: sample,
  };
}

export function getBedOrder(bedLabel) {
  if (!bedLabel) return Number.MAX_SAFE_INTEGER;
  const matched = String(bedLabel).match(/-(\d+)$/);
  return matched ? Number(matched[1]) : Number.MAX_SAFE_INTEGER;
}

/** 원무과 BedRoomPage 와 동일 — roomCapacity 칸(4인실=4칸)으로 정규화 */
/**
 * 침상 API가 잘못된 환자를 1번에 보여줄 때, 원무과 기준 앵커 환자(기만경)로 1번 침상 표시 보정.
 */
export function overlayAnchorPatientOnBed(beds, anchorPatient, room, bedNo = 1) {
  if (!anchorPatient?.patientId || !Array.isArray(beds) || beds.length === 0) {
    return beds;
  }
  const normalizedRoom = normalizeRoom(room);
  const anchorRoom = normalizeRoom(anchorPatient.room);
  if (anchorRoom !== normalizedRoom) {
    return beds;
  }

  return beds.map((bed) => {
    if (getBedOrder(bed.bedLabel) !== bedNo) {
      return bed;
    }
    if (Number(bed.patientId) === Number(anchorPatient.patientId)) {
      return bed;
    }
    return {
      ...bed,
      patientId: anchorPatient.patientId,
      patientName: resolveGuardianPatientDisplayName(
        anchorPatient.patientId,
        anchorPatient.name
      ),
      occupied: true,
      status:
        anchorPatient.patientStatus ??
        anchorPatient.status ??
        bed.status ??
        "안정",
      age: anchorPatient.age ?? bed.age,
      gender: anchorPatient.gender ?? bed.gender,
      locationId: anchorPatient.locationId ?? bed.locationId,
    };
  });
}

export function normalizeBedsByCapacity(room, roomCapacity, rawBeds) {
  const capacity = Number(roomCapacity);
  if (!capacity || capacity <= 0) return rawBeds;

  const bedMap = new Map(
    rawBeds.map((bed) => [getBedOrder(bed.bedLabel), bed])
  );

  return Array.from({ length: capacity }, (_, idx) => {
    const bedNo = idx + 1;
    const existing = bedMap.get(bedNo);
    if (existing) return existing;
    return {
      locationId: null,
      patientId: null,
      bedLabel: `${room}-${bedNo}`,
      patientName: null,
      gender: null,
      age: null,
      status: null,
      occupied: false,
      mealType: null,
      dietType: null,
      isVirtual: true,
    };
  });
}

export function mapBedFromApi(bed) {
  const patientId = bed.patientId;
  const displayName = patientId
    ? resolveGuardianPatientDisplayName(patientId, bed.name)
    : bed.name;
  return {
    locationId: bed.locationId,
    patientId,
    bedLabel: bed.bedId ?? "-",
    patientName: displayName,
    gender: bed.gender,
    age: bed.age,
    status: bed.status,
    occupied: Boolean(bed.occupied),
    mealType: bed.type ?? "일반식",
    dietType: bed.type,
  };
}

/** 병상·환자 목록에서 업무 체크용 환자 객체 찾기 */
export function resolvePatientForTaskCheck(patients, bed) {
  if (!bed?.patientId) return null;
  const fromList = (patients ?? []).find(
    (p) => Number(p.patientId) === Number(bed.patientId)
  );
  if (fromList) return fromList;
  return {
    patientId: bed.patientId,
    name: bed.patientName ?? resolveGuardianPatientDisplayName(bed.patientId, bed.name),
    age: bed.age,
    gender: bed.gender,
    room: null,
    building: null,
    dietType: bed.dietType ?? bed.mealType,
  };
}

export function isCriticalStatus(statusText) {
  const s = String(statusText ?? "");
  return s.includes("위험") || s.toUpperCase().includes("CRITICAL");
}
