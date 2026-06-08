export function genderLabelKo(g) {
  if (g == null) return '-';
  if (g === 'MALE') return '남성';
  if (g === 'FEMALE') return '여성';
  if (g === 'OTHER') return '기타';
  return String(g);
}

const BLOOD_LABELS = {
  A_POSITIVE: 'A+ 형',
  A_NEGATIVE: 'A- 형',
  B_POSITIVE: 'B+ 형',
  B_NEGATIVE: 'B- 형',
  O_POSITIVE: 'O+ 형',
  O_NEGATIVE: 'O- 형',
  AB_POSITIVE: 'AB+ 형',
  AB_NEGATIVE: 'AB- 형',
};

export function bloodTypeLabel(bt) {
  if (bt == null) return '-';
  return BLOOD_LABELS[bt] ?? String(bt).replace(/_/g, ' ');
}

export function displayPatientRef(patientId, admissionDate) {
  if (patientId == null) return '-';
  const y = admissionDate ? String(admissionDate).slice(0, 4) : new Date().getFullYear();
  return `${y}-KM${String(patientId).padStart(5, '0')}`;
}

export function formatBirthDot(birthDate) {
  if (!birthDate) return '-';
  const s = String(birthDate);
  if (s.length >= 10) return `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)}`;
  return s;
}

/** 시연 환자 기만경(patient_6) — AI 얼굴 DB 정렬 사진 */
export const DEMO_PATIENT_ID = 260401008;

export function resolvePatientAvatarUrl(patient) {
  const patientId = patient?.patientId;
  const name = patient?.name?.trim();

  if (patientId === DEMO_PATIENT_ID || name === '기만경') {
    return '/patients/kim-mankyung.jpg';
  }

  const seed = encodeURIComponent(name || String(patientId ?? 'patient'));
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;
}
