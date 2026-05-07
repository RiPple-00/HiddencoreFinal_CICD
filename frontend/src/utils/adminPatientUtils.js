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
