import { decodeJwtPayload, getAccessToken } from "../api";
import { fetchGuardianLinkedPatients } from "../api/careChecklistApi";
import {
  DEMO_GUARDIAN_PATIENT_ID,
  resolveGuardianPrimaryPatientId,
} from "./guardianPatientId";

export const DEFAULT_MEDICATION_PATIENT_ID =
  Number(process.env.EXPO_PUBLIC_MEDICATION_PATIENT_ID) || DEMO_GUARDIAN_PATIENT_ID;

export async function resolveMedicationScanContext() {
  const token = await getAccessToken();
  const payload = decodeJwtPayload(token);

  const guardianId =
    payload?.sub != null
      ? Number(payload.sub)
      : payload?.userId != null
        ? Number(payload.userId)
        : null;

  let patientId = DEFAULT_MEDICATION_PATIENT_ID;

  try {
    const linkedRes = await fetchGuardianLinkedPatients();
    const resolved = resolveGuardianPrimaryPatientId(linkedRes.data ?? []);
    if (resolved != null) {
      patientId = Number(resolved);
    }
  } catch {
    /* 연결 환자 조회 실패 시 시연 기본 환자 ID 사용 */
  }

  return {
    patientId,
    guardianId,
  };
}
