/**
 * 요양사 체크리스트(CaregiverTaskCheck)와 동일한 화면 상태 모델.
 * GET /api/caregiver/care-checks 응답 JSON ↔ UI state 변환.
 */

export const STATUS_TO_BACK = (s) => {
  if (s === "normal") return "NORMAL";
  if (s === "abnormal") return "ABNORMAL";
  return null;
};

export const STATUS_FROM_BACK = (s) => {
  if (s === "NORMAL") return "normal";
  if (s === "ABNORMAL") return "abnormal";
  return null;
};

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const emptyMealSlot = () => ({
  intake: { status: null, memo: "" },
  hydration: { status: null, memo: "" },
  incident: { status: null, memo: "" },
});

export const initialState = () => ({
  meal: {
    morning: emptyMealSlot(),
    lunch: emptyMealSlot(),
    dinner: emptyMealSlot(),
  },
  hygiene: {
    bedding: { status: null, memo: "" },
    patientItems: { status: null, memo: "" },
    bathing: { status: null, memo: "" },
  },
  condition: {
    breathing: { status: null, memo: "" },
    pain: { status: null, memo: "" },
    fall: { status: null, memo: "" },
  },
  elimination: {
    urination: { count: 0, logs: [] },
    defecation: { count: 0, logs: [] },
  },
  specialNotes: "",
});

export function buildPayload(state, patientId, recordDate) {
  const mapMealItem = (cell) => ({
    status: STATUS_TO_BACK(cell?.status),
    memo: cell?.memo ?? "",
  });
  const mapMealSlot = (slot) => ({
    intake: mapMealItem(slot?.intake),
    hydration: mapMealItem(slot?.hydration),
    incident: mapMealItem(slot?.incident),
  });
  const mapHygiene = (h) => ({
    status: STATUS_TO_BACK(h?.status),
    memo: h?.memo ?? "",
  });
  const mapCondition = (c) => ({
    status: STATUS_TO_BACK(c?.status),
    memo: c?.memo ?? "",
  });
  const mapElimination = (e) => {
    const logs = Array.isArray(e?.logs) ? e.logs : [];
    return {
      count: logs.length,
      logs: logs.map((l) => ({
        id: l.id,
        status: STATUS_TO_BACK(l.status),
        memo: l.memo ?? "",
        createdAt: l.createdAt,
      })),
    };
  };

  return {
    patientId,
    recordDate,
    content: {
      meal: {
        morning: mapMealSlot(state.meal.morning),
        lunch: mapMealSlot(state.meal.lunch),
        dinner: mapMealSlot(state.meal.dinner),
      },
      hygiene: {
        bedding: mapHygiene(state.hygiene.bedding),
        patientItems: mapHygiene(state.hygiene.patientItems),
        bathing: mapHygiene(state.hygiene.bathing),
      },
      condition: {
        breathing: mapCondition(state.condition.breathing),
        pain: mapCondition(state.condition.pain),
        fall: mapCondition(state.condition.fall),
      },
      elimination: {
        urination: mapElimination(state.elimination.urination),
        defecation: mapElimination(state.elimination.defecation),
      },
      specialNotes: state.specialNotes ?? "",
    },
  };
}

export function applyResponseToState(response) {
  if (!response || !response.content) return initialState();
  const c = response.content;

  const cell = (raw) => {
    if (raw == null) return { status: null, memo: "" };
    if (typeof raw === "string") return { status: STATUS_FROM_BACK(raw), memo: "" };
    return {
      status: STATUS_FROM_BACK(raw?.status),
      memo: raw?.memo ?? "",
    };
  };
  const slot = (s) => ({
    intake: cell(s?.intake),
    hydration: cell(s?.hydration),
    incident: cell(s?.incident),
  });
  const hygiene = (h) => ({
    status: STATUS_FROM_BACK(h?.status),
    memo: h?.memo ?? "",
  });
  const cond = (x) => ({
    status: STATUS_FROM_BACK(x?.status),
    memo: x?.memo ?? "",
  });
  const log = (l) => {
    if (!l || typeof l !== "object") return null;
    const back = l.status;
    let status =
      back === "NORMAL" ? "normal" : back === "ABNORMAL" ? "abnormal" : null;
    if (!status && typeof l.delta === "number") {
      status = l.delta > 0 ? "normal" : null;
    }
    return {
      id: l.id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      status,
      memo: l.memo ?? "",
      createdAt: l.createdAt ?? new Date().toISOString(),
    };
  };

  const elim = (x) => {
    const rawLogs = Array.isArray(x?.logs) ? x.logs : [];
    const logs = rawLogs.map(log).filter(Boolean);
    return {
      count: logs.length,
      logs,
    };
  };

  return {
    meal: {
      morning: slot(c.meal?.morning),
      lunch: slot(c.meal?.lunch),
      dinner: slot(c.meal?.dinner),
    },
    hygiene: {
      bedding: hygiene(c.hygiene?.bedding),
      patientItems: hygiene(c.hygiene?.patientItems),
      bathing: hygiene(c.hygiene?.bathing),
    },
    condition: {
      breathing: cond(c.condition?.breathing),
      pain: cond(c.condition?.pain),
      fall: cond(c.condition?.fall),
    },
    elimination: {
      urination: elim(c.elimination?.urination),
      defecation: elim(c.elimination?.defecation),
    },
    specialNotes: c.specialNotes ?? "",
  };
}
