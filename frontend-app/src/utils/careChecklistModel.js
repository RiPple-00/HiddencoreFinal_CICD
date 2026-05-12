/** 백엔드 PatientNote.content JSON과 동일 스키마 (요양사 저장 ↔ 보호자 실시간 조회) */

export function buildDefaultChecklist() {
  return {
    sections: [
      {
        id: "meal",
        title: "🍴 식사 (Meal)",
        rows: [
          { key: "meal_intake", label: "식사 섭취량", abnormal: false },
          { key: "fluid_intake", label: "수분 섭취량", abnormal: false },
          { key: "appetite", label: "식욕 변화", abnormal: false },
          { key: "meal_incident", label: "식사 중 사례 여부", abnormal: false },
        ],
      },
      {
        id: "hygiene",
        title: "🧼 위생점검 (Hygiene)",
        rows: [
          { key: "bedding", label: "침구류 청결도", abnormal: false },
          { key: "supplies", label: "환자 용품 청결", abnormal: false },
          { key: "bath", label: "목욕 여부", abnormal: false },
        ],
      },
      {
        id: "condition",
        title: "🛡️ 상태 안정화 (Condition)",
        rows: [
          { key: "breathing", label: "호흡 양상", abnormal: false },
          { key: "pain", label: "통증 유무", abnormal: false },
          { key: "fall", label: "낙상 유무", abnormal: false },
        ],
      },
      {
        id: "elimination",
        title: "👣 배뇨 및 배변",
        rows: [
          { key: "urination_count", label: "배뇨 횟수", abnormal: false },
          { key: "urination_state", label: "배뇨 상태", abnormal: false },
          { key: "defecation_count", label: "배변 횟수", abnormal: false },
          { key: "defecation_state", label: "배변 상태", abnormal: false },
        ],
      },
    ],
    memo: "",
  };
}

export function mergeChecklistFromServer(defaults, server) {
  const merged = JSON.parse(JSON.stringify(defaults));
  if (!server || typeof server !== "object") return merged;

  if (Array.isArray(server.sections)) {
    for (const s of merged.sections) {
      const remote = server.sections.find((x) => x && x.id === s.id);
      if (!remote || !Array.isArray(remote.rows)) continue;
      for (const r of s.rows) {
        const rr = remote.rows.find((x) => x && x.key === r.key);
        if (rr && typeof rr.abnormal === "boolean") r.abnormal = rr.abnormal;
      }
    }
  }
  if (typeof server.memo === "string") merged.memo = server.memo;
  return merged;
}
