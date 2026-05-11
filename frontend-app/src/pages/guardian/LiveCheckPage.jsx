import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import caregiverApi from "../../api/caregiverApi";
import { styles } from "../../styles/guardianChecklist.styles";
import { applyResponseToState, initialState, todayStr } from "../../utils/careCheckState";

const POLL_MS = 4000;

const MEAL_SLOTS = [
  { key: "morning", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
];
const MEAL_ROWS = [
  { key: "intake", label: "식사 섭취량", icon: "🍴" },
  { key: "hydration", label: "수분 섭취량", icon: "💧" },
  { key: "incident", label: "사례 여부", icon: "⚠️" },
];

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "normal", label: "정상" },
  { key: "warn", label: "주의" },
  { key: "danger", label: "이상" },
  { key: "empty", label: "기록없음" },
];

function formatRecordDateKorean(yyyyMmDd) {
  if (!yyyyMmDd || typeof yyyyMmDd !== "string") return "";
  const [y, m, d] = yyyyMmDd.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return yyyyMmDd;
  const dt = new Date(y, m - 1, d);
  const wk = ["일", "월", "화", "수", "목", "금", "토"][dt.getDay()];
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")} (${wk})`;
}

function formatTimeShort(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function formatLogTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** UI 필터용: normal | warn | danger | empty */
function cellDisplayLevel(cell) {
  if (!cell || cell.status == null) return "empty";
  if (cell.status === "normal") return "normal";
  if (cell.status === "abnormal") return "danger";
  return "empty";
}

function eliminationDisplay(elim) {
  const logs = elim?.logs ?? [];
  if (logs.length === 0) {
    return { level: "empty", meta: "기록 없음", desc: "" };
  }
  const anyAb = logs.some((l) => l.status === "abnormal");
  const level = anyAb ? "danger" : "normal";
  const meta = `${logs.length}회`;
  const desc = logs
    .map((l) => {
      const t = formatLogTime(l.createdAt);
      const st = l.status === "abnormal" ? "이상" : l.status === "normal" ? "정상" : "미분류";
      const memo = (l.memo && String(l.memo).trim()) || "메모 없음";
      return `${t ? `${t} · ` : ""}${st}\n${memo}`;
    })
    .join("\n\n");
  return { level, meta, desc };
}

function computeSummary(state) {
  const mealSlots = ["morning", "lunch", "dinner"];
  const mealRows = ["intake", "hydration", "incident"];
  const cells = [];
  mealSlots.forEach((sk) => {
    mealRows.forEach((rk) => cells.push(state.meal[sk][rk]));
  });
  ["bedding", "patientItems", "bathing"].forEach((k) => cells.push(state.hygiene[k]));
  ["breathing", "pain", "fall"].forEach((k) => cells.push(state.condition[k]));

  let normal = 0;
  let danger = 0;
  let emptyCells = 0;
  cells.forEach((c) => {
    if (c?.status == null) emptyCells += 1;
    else if (c.status === "normal") normal += 1;
    else danger += 1;
  });

  const elimLines = [state.elimination.urination, state.elimination.defecation];
  let elimNormal = 0;
  let elimDanger = 0;
  let elimEmpty = 0;
  elimLines.forEach((elim) => {
    const logs = elim?.logs ?? [];
    if (logs.length === 0) elimEmpty += 1;
    else if (logs.some((l) => l.status === "abnormal")) elimDanger += 1;
    else elimNormal += 1;
  });

  const total = cells.length + elimLines.length;
  const done =
    cells.filter((c) => c?.status != null).length +
    elimLines.filter((e) => (e?.logs ?? []).length > 0).length;
  const empty = emptyCells + elimEmpty;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return {
    total,
    done,
    percent,
    normal: normal + elimNormal,
    warn: 0,
    danger: danger + elimDanger,
    empty,
  };
}

function statusDocLabel(status) {
  if (status === "DRAFT") return "작성 중(자동 저장)";
  if (status === "PENDING_APPROVAL") return "제출됨";
  return status || "";
}

/* ===== 부품 컴포넌트 (기존 디자인 유지) ===== */

function StatusPill({ level = "normal", onPress, full = false }) {
  const labels = { normal: "정상", warn: "주의", danger: "이상", empty: "미기록" };
  const bgStyles = {
    normal: styles.pillNormal,
    warn: styles.pillWarn,
    danger: styles.pillDanger,
    empty: styles.pillEmpty,
  };
  const txtStyles = {
    normal: styles.pillTextNormal,
    warn: styles.pillTextWarn,
    danger: styles.pillTextDanger,
    empty: styles.pillTextEmpty,
  };
  const clickable = level === "danger" && onPress;
  const Wrap = clickable ? TouchableOpacity : View;
  return (
    <Wrap
      style={[styles.pill, bgStyles[level], full && styles.pillFull]}
      onPress={clickable ? onPress : undefined}
    >
      <Text style={[styles.pillText, txtStyles[level]]}>{labels[level]}</Text>
    </Wrap>
  );
}

function Row({ label, level = "normal", onDetailPress, filter }) {
  if (filter && filter !== "all" && filter !== level) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <StatusPill
        level={level}
        onPress={level === "danger" && onDetailPress ? onDetailPress : undefined}
        full
      />
    </View>
  );
}

function MetaRow({ label, meta, level = "normal", onDetailPress, filter }) {
  if (filter && filter !== "all" && filter !== level) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.metaRight}>
        <Text style={styles.metaText}>{meta}</Text>
        <StatusPill
          level={level}
          onPress={level === "danger" && onDetailPress ? onDetailPress : undefined}
          full
        />
      </View>
    </View>
  );
}

function GridRow({ label, states, filter }) {
  const visible = !filter || filter === "all" ? true : states.some((s) => s.level === filter);
  if (!visible) return null;
  return (
    <View style={styles.gridRow}>
      <Text style={[styles.rowLabel, styles.gridRowLabel]}>{label}</Text>
      {states.map((s, i) => (
        <View key={i} style={styles.gridCell}>
          <StatusPill
            level={s.level}
            onPress={s.level === "danger" && s.onPress ? s.onPress : undefined}
          />
        </View>
      ))}
    </View>
  );
}

function SectionHeader({ num, icon, title, time }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionNum}>
        <Text style={styles.sectionNumText}>{num}</Text>
      </View>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionTime}>{time}</Text>
    </View>
  );
}

function GridColumnHeader({ columns }) {
  return (
    <View style={styles.gridColHeader}>
      <Text style={styles.gridColHeaderText}>항목</Text>
      {columns.map((c) => (
        <View key={c} style={styles.gridCell}>
          <Text style={styles.gridColHeaderTextCenter}>{c}</Text>
        </View>
      ))}
    </View>
  );
}

function ProgressRing({ percent, size = 78, strokeWidth = 8 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);
  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#FAEEDA" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#D85A30"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={styles.ringText}>
        <Text style={styles.ringPercent}>{percent}%</Text>
        <Text style={styles.ringLabel}>완료</Text>
      </View>
    </View>
  );
}

function StatusCard({ summary, dateLine }) {
  const stats = [
    { label: "정상", value: summary.normal, dotStyle: styles.dotNormal },
    { label: "주의", value: summary.warn, dotStyle: styles.dotWarn },
    { label: "이상", value: summary.danger, dotStyle: styles.dotDanger },
  ];
  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusCardTitle}>오늘 체크 현황</Text>
      <Text style={styles.statusCardDate}>{dateLine}</Text>
      <View style={styles.statusCardBody}>
        <ProgressRing percent={summary.percent} />
        <View style={styles.statusCardStats}>
          <Text style={styles.statusSummaryText}>
            전체 {summary.total}개 항목 중 <Text style={styles.statusSummaryBold}>{summary.done}개 입력</Text>
          </Text>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statItem}>
                <View style={[styles.dot, s.dotStyle]} />
                <Text style={styles.statText}>
                  {s.label} {s.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function FilterTabs({ value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
      {FILTERS.map((f) => {
        const active = value === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[styles.filterTab, active && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function DetailModal({ detail, onClose }) {
  return (
    <Modal visible={!!detail} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          {detail && (
            <>
              <View style={styles.modalHead}>
                <Text style={styles.modalTitle}>
                  {detail.level === "warn" ? "주의 항목 상세 사유" : "이상 항목 상세"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.modalCloseIcon}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalItemRow}>
                <Text style={styles.modalItemIcon}>{detail.icon}</Text>
                <Text style={styles.modalItemName}>{detail.name}</Text>
                <StatusPill level={detail.level} full />
              </View>
              <Text style={styles.modalDesc}>{detail.desc}</Text>
              <TouchableOpacity style={styles.modalConfirm} onPress={onClose}>
                <Text style={styles.modalConfirmText}>확인</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function BottomNav({ navigation }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.bottomItem} onPress={() => navigation?.navigate?.("GuardianMain")}>
        <Text style={styles.bottomIcon}>🏠</Text>
        <Text style={styles.bottomLabel}>홈</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomItem} onPress={() => navigation?.navigate?.("Calendar")}>
        <Text style={styles.bottomIcon}>📆</Text>
        <Text style={styles.bottomLabel}>달력</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomItem} onPress={() => navigation?.navigate?.("Payment")}>
        <Text style={styles.bottomIcon}>💵</Text>
        <Text style={styles.bottomLabel}>수납</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomItem}>
        <View style={styles.bottomActiveBg}>
          <Text style={styles.bottomIcon}>✅</Text>
        </View>
        <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>실시간</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomItem} onPress={() => navigation?.navigate?.("Chatbot")}>
        <Text style={styles.bottomIcon}>💬</Text>
        <Text style={styles.bottomLabel}>챗봇</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===== 메인 ===== */

export default function LiveCheckPage({ navigation, route }) {
  const params = route?.params ?? {};
  const patientId = params.patientId ?? 1;
  const patientName = params.patientName ?? "환자";
  const recordDate = params.recordDate ?? todayStr();

  const [state, setState] = useState(initialState);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recordMeta, setRecordMeta] = useState({
    updatedAt: null,
    patientNameFromApi: "",
    documentStatus: null,
    syncHint: "",
  });

  const fetchCareCheck = useCallback(async () => {
    const { data } = await caregiverApi.getOne({ patientId, date: recordDate });
    setState(applyResponseToState(data));
    setRecordMeta((prev) => ({
      ...prev,
      updatedAt: data?.updatedAt ?? null,
      patientNameFromApi: data?.patientName ?? "",
      documentStatus: data?.status ?? null,
      syncHint: data?.updatedAt ? `${formatTimeShort(data.updatedAt)} 갱신` : "",
    }));
  }, [patientId, recordDate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootLoading(true);
      try {
        await fetchCareCheck();
      } catch {
        if (!cancelled) {
          setState(initialState());
          setRecordMeta((p) => ({ ...p, syncHint: "불러오기 실패" }));
        }
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchCareCheck]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchCareCheck().catch(() => {
        setRecordMeta((p) => ({ ...p, syncHint: "동기화 실패" }));
      });
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchCareCheck]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCareCheck();
      setRecordMeta((p) => ({ ...p, syncHint: "방금 새로고침" }));
    } catch {
      setRecordMeta((p) => ({ ...p, syncHint: "새로고침 실패" }));
    } finally {
      setRefreshing(false);
    }
  }, [fetchCareCheck]);

  const summary = useMemo(() => computeSummary(state), [state]);
  const dateLine = formatRecordDateKorean(recordDate);
  const sectionTime = `반영 ${formatTimeShort(recordMeta.updatedAt)}`;
  const displayPatient = recordMeta.patientNameFromApi || patientName;

  const openCellDetail = (name, icon, cell) => {
    if (cell?.status !== "abnormal") return;
    const memo = (cell.memo && String(cell.memo).trim()) || "요양사가 이상으로 표시했습니다. (메모 없음)";
    setDetail({ name, icon, level: "danger", desc: memo });
  };

  const openElimDetail = (title, icon, elimDisp) => {
    if (elimDisp.level !== "danger" || !elimDisp.desc) return;
    setDetail({ name: title, icon, level: "danger", desc: elimDisp.desc });
  };

  const elimU = useMemo(() => eliminationDisplay(state.elimination.urination), [state.elimination.urination]);
  const elimD = useMemo(() => eliminationDisplay(state.elimination.defecation), [state.elimination.defecation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoIcon}>♥</Text>
            <Text style={styles.logoText}>마음돌봄</Text>
          </View>
          <View style={styles.headerIcons}>
            <Text style={styles.iconText}>🔔</Text>
            <Text style={styles.iconText}>👤</Text>
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>
            안녕하세요, 보호자님 <Text style={styles.greetingHeart}>♥</Text>
          </Text>
          <Text style={styles.greetingSub}>
            {displayPatient} 님의 돌봄 기록 · {recordMeta.syncHint || "실시간 반영 중"}
          </Text>
          {!!recordMeta.documentStatus && (
            <Text style={[styles.greetingSub, { marginTop: 4, opacity: 0.85 }]}>
              {statusDocLabel(recordMeta.documentStatus)}
            </Text>
          )}
        </View>

        {bootLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#D85A30" />
            <Text style={{ marginTop: 12, fontSize: 12, color: "#888780" }}>체크리스트 불러오는 중…</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D85A30" />}
          >
            <StatusCard summary={summary} dateLine={dateLine} />
            <FilterTabs value={filter} onChange={setFilter} />

            {/* 1. 식사 — CaregiverMealCheckTable 과 동일 행/열 */}
            <View style={styles.card}>
              <SectionHeader num={1} icon="🍴" title="식사" time={sectionTime} />
              <GridColumnHeader columns={MEAL_SLOTS.map((s) => s.label)} />
              {MEAL_ROWS.map((row) => (
                <GridRow
                  key={row.key}
                  label={row.label}
                  filter={filter}
                  states={MEAL_SLOTS.map((slot) => {
                    const cell = state.meal[slot.key][row.key];
                    const level = cellDisplayLevel(cell);
                    return {
                      level,
                      onPress: () =>
                        openCellDetail(`${row.label} · ${slot.label}`, row.icon, cell),
                    };
                  })}
                />
              ))}
            </View>

            {/* 2. 위생 — CaregiverHygieneRow 라벨과 동일 */}
            <View style={styles.card}>
              <SectionHeader num={2} icon="🧼" title="위생·청결" time={sectionTime} />
              <Row
                label="침구류 청결도"
                level={cellDisplayLevel(state.hygiene.bedding)}
                filter={filter}
                onDetailPress={() => openCellDetail("침구류 청결도", "🧼", state.hygiene.bedding)}
              />
              <Row
                label="환자 용품 청결"
                level={cellDisplayLevel(state.hygiene.patientItems)}
                filter={filter}
                onDetailPress={() => openCellDetail("환자 용품 청결", "🧴", state.hygiene.patientItems)}
              />
              <Row
                label="목욕 여부"
                level={cellDisplayLevel(state.hygiene.bathing)}
                filter={filter}
                onDetailPress={() => openCellDetail("목욕 여부", "🛁", state.hygiene.bathing)}
              />
            </View>

            {/* 3. 상태 — CaregiverConditionRow 와 동일 */}
            <View style={styles.card}>
              <SectionHeader num={3} icon="🛡️" title="상태 안전" time={sectionTime} />
              <Row
                label="호흡 양상"
                level={cellDisplayLevel(state.condition.breathing)}
                filter={filter}
                onDetailPress={() => openCellDetail("호흡 양상", "🫁", state.condition.breathing)}
              />
              <Row
                label="통증 유무"
                level={cellDisplayLevel(state.condition.pain)}
                filter={filter}
                onDetailPress={() => openCellDetail("통증 유무", "🩹", state.condition.pain)}
              />
              <Row
                label="낙상 유무"
                level={cellDisplayLevel(state.condition.fall)}
                filter={filter}
                onDetailPress={() => openCellDetail("낙상 유무", "⚠️", state.condition.fall)}
              />
            </View>

            {/* 4. 배뇨·배변 */}
            <View style={styles.card}>
              <SectionHeader num={4} icon="👣" title="배뇨 및 배변" time={sectionTime} />
              <MetaRow
                label="배뇨 (Urination)"
                meta={elimU.meta}
                level={elimU.level}
                filter={filter}
                onDetailPress={() => openElimDetail("배뇨 (Urination)", "💧", elimU)}
              />
              <MetaRow
                label="배변 (Defecation)"
                meta={elimD.meta}
                level={elimD.level}
                filter={filter}
                onDetailPress={() => openElimDetail("배변 (Defecation)", "🚻", elimD)}
              />
            </View>

            {/* 5. 특이사항 */}
            <View style={styles.card}>
              <SectionHeader num={5} icon="📝" title="특이사항" time={sectionTime} />
              <Text style={styles.specialNotesReadonly}>
                {(state.specialNotes && state.specialNotes.trim()) || "등록된 특이사항이 없습니다."}
              </Text>
            </View>
          </ScrollView>
        )}

        <BottomNav navigation={navigation} />
        <DetailModal detail={detail} onClose={() => setDetail(null)} />
      </View>
    </SafeAreaView>
  );
}
