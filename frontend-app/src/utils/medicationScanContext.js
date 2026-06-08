import { decodeJwtPayload, getAccessToken } from "../api";
import { DEMO_GUARDIAN_PATIENT_ID } from "./guardianPatientId";

export const DEFAULT_MEDICATION_PATIENT_ID =
  Number(process.env.EXPO_PUBLIC_MEDICATION_PATIENT_ID) || DEMO_GUARDIAN_PATIENT_ID;

export async function resolveMedicationScanContext() {
  const token = await getAccessToken();
  const payload = decodeJwtPayload(token);
  const guardianId =
    payload?.role === "GUARDIAN" && payload?.userId != null
      ? Number(payload.userId)
      : null;

  return {
    patientId: DEFAULT_MEDICATION_PATIENT_ID,
    guardianId,
  };
}
