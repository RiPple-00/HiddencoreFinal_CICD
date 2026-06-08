/** 시연 보호자(guardian001) 기준 환자 — 기만경 patient_6 */
export const DEMO_GUARDIAN_PATIENT_ID =
  Number(process.env.EXPO_PUBLIC_GALLERY_PATIENT_ID) ||
  Number(process.env.EXPO_PUBLIC_PATIENT_ID) ||
  260401008;

export const DEMO_GUARDIAN_PATIENT_NAME = "기만경";

/** API/DB 인코딩 깨짐(???, replacement char 등) 여부 */
export function isGarbledPatientName(name) {
  const raw = typeof name === "string" ? name.trim() : "";
  if (!raw) return true;
  return /^[?\uFFFD]+$/.test(raw);
}

/**
 * 환자 ID·API 이름으로 UI 표시명 결정.
 * 시연 환자(기만경)는 항상 한글 이름, 그 외는 API 값(깨지면 "환자").
 */
export function resolveGuardianPatientDisplayName(patientId, apiName) {
  const id = Number(patientId);
  if (id === DEMO_GUARDIAN_PATIENT_ID) {
    return DEMO_GUARDIAN_PATIENT_NAME;
  }
  const raw = typeof apiName === "string" ? apiName.trim() : "";
  if (!isGarbledPatientName(raw)) {
    return raw;
  }
  return "환자";
}

/** @deprecated DEMO_GUARDIAN_PATIENT_ID 와 동일 */
export const GALLERY_DEMO_PATIENT_ID = DEMO_GUARDIAN_PATIENT_ID;

/**
 * 연결 환자 목록에서 보호자 기본 환자 선택.
 * 갤러리·보고서·실시간·면회·프로그램 등 공통: 기만경(260401008) 우선.
 */
export function resolveGuardianPrimaryPatientId(linkedPatients) {
  if (!Array.isArray(linkedPatients) || linkedPatients.length === 0) {
    return null;
  }
  const demo = linkedPatients.find(
    (p) => Number(p.patientId) === DEMO_GUARDIAN_PATIENT_ID
  );
  if (demo) {
    return demo.patientId;
  }
  const primary = linkedPatients.find((p) => p.primary);
  if (primary) {
    return primary.patientId;
  }
  return linkedPatients[0]?.patientId ?? null;
}

/** @deprecated resolveGuardianPrimaryPatientId 사용 */
export function resolveGuardianGalleryPatientId(linkedPatients) {
  return resolveGuardianPrimaryPatientId(linkedPatients);
}
