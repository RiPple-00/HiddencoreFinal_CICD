function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDateString(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function dayPattern(day) {
  // 1개월 내에 정상/주의/위험 케이스를 섞어 QA에 쓰기 쉽게 패턴화
  const fallAlert = day === 12 || day === 27;
  const lowHydration = day % 7 === 0 || day === 18;
  const appetiteLow = day % 9 === 0;
  const painAbnormal = day % 10 === 0;
  const breathingAbnormal = day === 21;

  return {
    fallAlert,
    lowHydration,
    appetiteLow,
    painAbnormal,
    breathingAbnormal,
  };
}

function statusCell(status, memo = "") {
  return { status, memo };
}

function buildMealSection(pattern) {
  const intakeStatus = pattern.appetiteLow ? "ABNORMAL" : "NORMAL";
  const hydrationStatus = pattern.lowHydration ? "ABNORMAL" : "NORMAL";
  const incidentStatus = pattern.fallAlert ? "ABNORMAL" : "NORMAL";

  return {
    morning: {
      intake: statusCell(intakeStatus, pattern.appetiteLow ? "아침 식사량 평소 대비 감소" : ""),
      hydration: statusCell(hydrationStatus, pattern.lowHydration ? "수분 섭취량이 적음" : ""),
      incident: statusCell("NORMAL", ""),
    },
    lunch: {
      intake: statusCell(intakeStatus, pattern.appetiteLow ? "점심 식욕 저하" : ""),
      hydration: statusCell(hydrationStatus, pattern.lowHydration ? "점심 물 섭취 부족" : ""),
      incident: statusCell(incidentStatus, pattern.fallAlert ? "식사 중 어지럼 호소" : ""),
    },
    dinner: {
      intake: statusCell("NORMAL", ""),
      hydration: statusCell(hydrationStatus, pattern.lowHydration ? "저녁 수분 섭취 권고" : ""),
      incident: statusCell("NORMAL", ""),
    },
  };
}

function buildHygieneSection(pattern) {
  return {
    bedding: statusCell("NORMAL", ""),
    patientItems: statusCell(pattern.fallAlert ? "ABNORMAL" : "NORMAL", pattern.fallAlert ? "보행보조기 재정비 필요" : ""),
    bathing: statusCell("NORMAL", ""),
  };
}

function buildConditionSection(pattern) {
  return {
    breathing: statusCell(pattern.breathingAbnormal ? "ABNORMAL" : "NORMAL", pattern.breathingAbnormal ? "호흡 빠름 관찰" : ""),
    pain: statusCell(pattern.painAbnormal ? "ABNORMAL" : "NORMAL", pattern.painAbnormal ? "허리 통증 호소" : ""),
    fall: statusCell(pattern.fallAlert ? "ABNORMAL" : "NORMAL", pattern.fallAlert ? "이동 중 중심 잃음" : ""),
  };
}

function buildEliminationSection(pattern, year, month, day) {
  const baseIso = `${toDateString(year, month, day)}T09:00:00`;

  const urinationLogs = [
    { id: `u-${day}-1`, status: "NORMAL", memo: "오전 배뇨", createdAt: baseIso },
    { id: `u-${day}-2`, status: pattern.lowHydration ? "ABNORMAL" : "NORMAL", memo: pattern.lowHydration ? "소변량 감소" : "오후 배뇨", createdAt: `${toDateString(year, month, day)}T16:00:00` },
  ];

  const defecationLogs = day % 3 === 0
    ? [{ id: `d-${day}-1`, status: "NORMAL", memo: "배변 확인", createdAt: `${toDateString(year, month, day)}T10:30:00` }]
    : [];

  return {
    urination: {
      count: urinationLogs.length,
      logs: urinationLogs,
    },
    defecation: {
      count: defecationLogs.length,
      logs: defecationLogs,
    },
  };
}

function buildSpecialNotes(pattern) {
  const notes = [];
  if (pattern.lowHydration) notes.push("수분 섭취량이 평소보다 적어 수시 권고함");
  if (pattern.appetiteLow) notes.push("식사량 감소 관찰되어 간식 보충");
  if (pattern.painAbnormal) notes.push("통증 호소로 체위 변경 및 휴식 유도");
  if (pattern.breathingAbnormal) notes.push("호흡 패턴 변화 관찰, 추가 모니터링 필요");
  if (pattern.fallAlert) notes.push("이동 시 낙상 위험 있어 보행 보조 강화");

  return notes.length ? notes.join(". ") : "특이사항 없음";
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function generateMonthlyCareChecklistDummy({
  patientId = 1,
  year = 2026,
  month = 5,
} = {}) {
  const count = daysInMonth(year, month);
  const items = [];

  for (let day = 1; day <= count; day += 1) {
    const pattern = dayPattern(day);
    items.push({
      patientId,
      recordDate: toDateString(year, month, day),
      content: {
        meal: buildMealSection(pattern),
        hygiene: buildHygieneSection(pattern),
        condition: buildConditionSection(pattern),
        elimination: buildEliminationSection(pattern, year, month, day),
        specialNotes: buildSpecialNotes(pattern),
      },
    });
  }

  return items;
}

export const CARE_CHECK_DUMMY_MAY_2026 = generateMonthlyCareChecklistDummy({
  patientId: 1,
  year: 2026,
  month: 5,
});
