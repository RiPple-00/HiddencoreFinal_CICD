import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import Text from "@/components/Text";
import Svg, { Circle } from "react-native-svg";

import caregiverApi from "../../api/caregiverApi";
import { applyResponseToState, initialState, todayStr } from "../../utils/careCheckState";

const POLL_MS = 4000;

const MEAL_SLOTS = [
  { key: "morning", label: "아침" },
  { key: "lunch",   label: "점심" },
  { key: "dinner",  label: "저녁" },
];
const MEAL_ROWS = [
  { key: "intake",     label: "식사 섭취량", icon: "🍴" },
  { key: "hydration",  label: "수분 섭취량", icon: "💧" },
  { key: "incident",   label: "사례 여부",   icon: "⚠️" },
];
const FILTERS = [
  { key: "all",    label: "전체" },
  { key: "normal", label: "정상" },
  { key: "warn",   label: "주의" },
  { key: "danger", label: "이상" },
  { key: "empty",  label: "기록없음" },
];

/* ── 유틸 함수 (변경 없음) ───────────────────────────── */
function formatRecordDateKorean(yyyyMmDd) {
  if (!yyyyMmDd || typeof yyyyMmDd !== "string") return "";
  const [y, m, d] = yyyyMmDd.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return yyyyMmDd;
  const dt  = new Date(y, m - 1, d);
  const wk  = ["일","월","화","수","목","금","토"][dt.getDay()];
  return `${y}.${String(m).padStart(2,"0")}.${String(d).padStart(2,"0")} (${wk})`;
}
function formatTimeShort(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}
function formatLogTime(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}
function cellDisplayLevel(cell) {
  if (!cell || cell.status == null)       return "empty";
  if (cell.status === "normal")           return "normal";
  if (cell.status === "abnormal")         return "danger";
  return "empty";
}
function eliminationDisplay(elim) {
  const logs = elim?.logs ?? [];
  if (logs.length === 0) return { level: "empty", meta: "기록 없음", desc: "" };
  const anyAb = logs.some((l) => l.status === "abnormal");
  const level = anyAb ? "danger" : "normal";
  const meta  = `${logs.length}회`;
  const desc  = logs.map((l) => {
    const t  = formatLogTime(l.createdAt);
    const st = l.status === "abnormal" ? "이상" : l.status === "normal" ? "정상" : "미분류";
    const memo = (l.memo && String(l.memo).trim()) || "메모 없음";
    return `${t ? `${t} · ` : ""}${st}\n${memo}`;
  }).join("\n\n");
  return { level, meta, desc };
}
function computeSummary(state) {
  const mealSlots = ["morning","lunch","dinner"];
  const mealRows  = ["intake","hydration","incident"];
  const cells     = [];
  mealSlots.forEach((sk) => mealRows.forEach((rk) => cells.push(state.meal[sk][rk])));
  ["bedding","patientItems","bathing"].forEach((k) => cells.push(state.hygiene[k]));
  ["breathing","pain","fall"].forEach((k) => cells.push(state.condition[k]));
  let normal = 0, danger = 0, emptyCells = 0;
  cells.forEach((c) => {
    if (c?.status == null) emptyCells += 1;
    else if (c.status === "normal") normal += 1;
    else danger += 1;
  });
  const elimLines = [state.elimination.urination, state.elimination.defecation];
  let elimNormal = 0, elimDanger = 0, elimEmpty = 0;
  elimLines.forEach((elim) => {
    const logs = elim?.logs ?? [];
    if (logs.length === 0) elimEmpty += 1;
    else if (logs.some((l) => l.status === "abnormal")) elimDanger += 1;
    else elimNormal += 1;
  });
  const total = cells.length + elimLines.length;
  const done  = cells.filter((c) => c?.status != null).length +
                elimLines.filter((e) => (e?.logs ?? []).length > 0).length;
  const empty   = emptyCells + elimEmpty;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent, normal: normal + elimNormal, warn: 0, danger: danger + elimDanger, empty };
}
function statusDocLabel(status) {
  if (status === "DRAFT")            return "작성 중(자동 저장)";
  if (status === "PENDING_APPROVAL") return "제출됨";
  return status || "";
}

/* ── StatusPill ─────────────────────────────────────── */
function StatusPill({ level = "normal", onPress, full = false }) {
  const labels = { normal: "정상", warn: "주의", danger: "이상", empty: "미기록" };

  const bgClass = {
    normal: "bg-success-secondary",
    warn:   "bg-guardian-button-secondary",
    danger: "bg-error-secondary",
    empty:  "bg-guardian-bg-secondary",
  }[level];

  const textClass = {
    normal: "text-success-primary",
    warn:   "text-guardian-text-secondary",
    danger: "text-error-primary",
    empty:  "text-guardian-text-neutral opacity-40",
  }[level];

  const clickable = level === "danger" && onPress;
  const Wrap = clickable ? TouchableOpacity : View;

  return (
    <Wrap
      className={`px-3 py-1 rounded-full items-center justify-center ${bgClass} ${full ? "flex-1" : ""}`}
      onPress={clickable ? onPress : undefined}
    >
      <Text className={`text-xs font-bold ${textClass}`}>{labels[level]}</Text>
    </Wrap>
  );
}

/* ── Row / MetaRow / GridRow ────────────────────────── */
function Row({ label, level = "normal", onDetailPress, filter }) {
  if (filter && filter !== "all" && filter !== level) return null;
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-guardian-bg-secondary">
      <Text className="text-sm text-guardian-text-neutral flex-1">{label}</Text>
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
    <View className="flex-row items-center justify-between py-3 border-b border-guardian-bg-secondary">
      <Text className="text-sm text-guardian-text-neutral flex-1">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-xs text-guardian-text-neutral">{meta}</Text>
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
    <View className="flex-row items-center py-2 border-b border-guardian-bg-secondary">
      <Text className="text-sm text-guardian-text-neutral flex-1">{label}</Text>
      {states.map((s, i) => (
        <View key={i} className="flex-1 items-center">
          <StatusPill
            level={s.level}
            onPress={s.level === "danger" && s.onPress ? s.onPress : undefined}
          />
        </View>
      ))}
    </View>
  );
}

/* ── SectionHeader ──────────────────────────────────── */
function SectionHeader({ num, icon, title, time }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <View className="w-6 h-6 rounded-full bg-guardian-button-primary justify-center items-center">
        <Text className="text-xs font-bold text-guardian-text-primary">{num}</Text>
      </View>
      <Text className="text-base">{icon}</Text>
      <Text className="font-bold text-guardian-text-primary flex-1">{title}</Text>
      <Text className="text-xs text-guardian-text-neutral">{time}</Text>
    </View>
  );
}

/* ── GridColumnHeader ───────────────────────────────── */
function GridColumnHeader({ columns }) {
  return (
    <View className="flex-row items-center mb-2 border-b border-guardian-button-secondary pb-2">
      <Text className="flex-1 text-xs font-bold text-guardian-text-neutral">항목</Text>
      {columns.map((c) => (
        <View key={c} className="flex-1 items-center">
          <Text className="text-xs font-bold text-guardian-text-neutral text-center">{c}</Text>
        </View>
      ))}
    </View>
  );
}

/* ── ProgressRing ───────────────────────────────────── */
function ProgressRing({ percent, size = 78, strokeWidth = 8 }) {
  const r      = (size - strokeWidth) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);
  return (
    <View style={{ width: size, height: size }} className="relative justify-center items-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        {/* 트랙: guardian-button-secondary */}
        <Circle cx={size/2} cy={size/2} r={r} stroke="#FEF7E5" strokeWidth={strokeWidth} fill="none" />
        {/* 진행: guardian-button-primary */}
        <Circle
          cx={size/2} cy={size/2} r={r}
          stroke="#FCC101" strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="font-extrabold text-base text-guardian-text-primary">{percent}%</Text>
        <Text className="text-xs text-guardian-text-neutral">완료</Text>
      </View>
    </View>
  );
}

/* ── StatusCard ─────────────────────────────────────── */
function StatusCard({ summary, dateLine }) {
  const stats = [
    { label: "정상", value: summary.normal, dotClass: "bg-success-primary" },
    { label: "주의", value: summary.warn,   dotClass: "bg-guardian-text-secondary" },
    { label: "이상", value: summary.danger, dotClass: "bg-error-primary" },
  ];
  return (
    <View className="bg-background-neutral mx-5 mt-4 rounded-2xl p-4">
      <Text className="font-extrabold text-guardian-text-primary">오늘 체크 현황</Text>
      <Text className="text-xs text-guardian-text-neutral mt-1">{dateLine}</Text>
      <View className="flex-row items-center mt-3 gap-4">
        <ProgressRing percent={summary.percent} />
        <View className="flex-1">
          <Text className="text-xs text-guardian-text-neutral">
            전체 {summary.total}개 항목 중{" "}
            <Text className="font-bold text-guardian-text-primary">{summary.done}개 입력</Text>
          </Text>
          <View className="flex-row gap-3 mt-2">
            {stats.map((s) => (
              <View key={s.label} className="flex-row items-center gap-1">
                <View className={`w-2 h-2 rounded-full ${s.dotClass}`} />
                <Text className="text-xs text-guardian-text-neutral">
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

/* ── FilterTabs ─────────────────────────────────────── */
function FilterTabs({ value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
    >
      {FILTERS.map((f) => {
        const active = value === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => onChange(f.key)}
            className={`px-4 py-2 rounded-full border ${
              active
                ? "bg-guardian-button-primary border-guardian-button-primary"
                : "bg-guardian-bg-secondary border-guardian-button-secondary"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                active ? "text-guardian-text-primary" : "text-guardian-text-neutral"
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/* ── DetailModal ─────────────────────────────────────── */
function DetailModal({ detail, onClose }) {
  return (
    <Modal visible={!!detail} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
        <Pressable className="bg-background-neutral rounded-2xl p-5 w-full" onPress={() => {}}>
          {detail && (
            <>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-extrabold text-guardian-text-primary">
                  {detail.level === "warn" ? "주의 항목 상세 사유" : "이상 항목 상세"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Text className="text-xl text-guardian-text-neutral">×</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-xl">{detail.icon}</Text>
                <Text className="flex-1 font-bold text-guardian-text-primary">{detail.name}</Text>
                <StatusPill level={detail.level} full />
              </View>
              <Text className="text-sm text-guardian-text-neutral leading-6 bg-guardian-bg-secondary p-3 rounded-xl mb-4">
                {detail.desc}
              </Text>
              <TouchableOpacity
                className="bg-guardian-button-primary py-3 rounded-full items-center"
                onPress={onClose}
              >
                <Text className="font-extrabold text-guardian-text-primary">확인</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ── BottomNav ──────────────────────────────────────── */
function BottomNav({ navigation }) {
  const items = [
    { icon: "🏠", label: "홈",    route: "GuardianMain" },
    { icon: "📆", label: "달력",  route: "Calendar" },
    { icon: "💵", label: "수납",  route: "Payment" },
    { icon: "✅", label: "실시간", route: null, active: true },
    { icon: "💬", label: "챗봇",  route: "Chatbot" },
  ];
  return (
    <View className="flex-row justify-around bg-background-neutral border-t border-guardian-button-secondary py-3">
      {items.map(({ icon, label, route, active }) => (
        <TouchableOpacity
          key={label}
          className="items-center"
          onPress={() => route && navigation?.navigate?.(route)}
        >
          {active ? (
            <View className="bg-guardian-button-secondary px-2 py-1 rounded-full">
              <Text className="text-xl">{icon}</Text>
            </View>
          ) : (
            <Text className="text-xl">{icon}</Text>
          )}
          <Text className={`text-[10px] font-bold mt-1 ${active ? "text-guardian-text-secondary" : "text-guardian-text-neutral"}`}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ══════════════════════════════════════════════════════
   메인 페이지
══════════════════════════════════════════════════════ */
export default function LiveCheckPage({ navigation, route }) {
  const params      = route?.params ?? {};
  const patientId   = params.patientId   ?? 1;
  const patientName = params.patientName ?? "환자";
  const recordDate  = params.recordDate  ?? todayStr();

  const [state,      setState]      = useState(initialState);
  const [filter,     setFilter]     = useState("all");
  const [detail,     setDetail]     = useState(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recordMeta, setRecordMeta] = useState({
    updatedAt: null, patientNameFromApi: "", documentStatus: null, syncHint: "",
  });

  const fetchCareCheck = useCallback(async () => {
    const { data } = await caregiverApi.getOne({ patientId, date: recordDate });
    setState(applyResponseToState(data));
    setRecordMeta((prev) => ({
      ...prev,
      updatedAt:          data?.updatedAt   ?? null,
      patientNameFromApi: data?.patientName ?? "",
      documentStatus:     data?.status      ?? null,
      syncHint: data?.updatedAt ? `${formatTimeShort(data.updatedAt)} 갱신` : "",
    }));
  }, [patientId, recordDate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootLoading(true);
      try { await fetchCareCheck(); }
      catch { if (!cancelled) { setState(initialState()); setRecordMeta((p) => ({ ...p, syncHint: "불러오기 실패" })); } }
      finally { if (!cancelled) setBootLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [fetchCareCheck]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchCareCheck().catch(() => setRecordMeta((p) => ({ ...p, syncHint: "동기화 실패" })));
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchCareCheck]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchCareCheck(); setRecordMeta((p) => ({ ...p, syncHint: "방금 새로고침" })); }
    catch { setRecordMeta((p) => ({ ...p, syncHint: "새로고침 실패" })); }
    finally { setRefreshing(false); }
  }, [fetchCareCheck]);

  const summary        = useMemo(() => computeSummary(state), [state]);
  const dateLine       = formatRecordDateKorean(recordDate);
  const sectionTime    = `반영 ${formatTimeShort(recordMeta.updatedAt)}`;
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

  const elimU = useMemo(() => eliminationDisplay(state.elimination.urination),  [state.elimination.urination]);
  const elimD = useMemo(() => eliminationDisplay(state.elimination.defecation), [state.elimination.defecation]);

  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-primary">
      <View className="flex-1">

        {/* 헤더 */}
        <View className="flex-row justify-between items-center px-5 py-4 bg-background-neutral border-b border-guardian-button-secondary">
          <View className="flex-row items-center gap-2">
            <Text className="text-guardian-text-secondary text-xl">♥</Text>
            <Text className="font-extrabold text-lg text-guardian-text-primary">마음돌봄</Text>
          </View>
          <View className="flex-row gap-3">
            <Text className="text-xl">🔔</Text>
            <Text className="text-xl">👤</Text>
          </View>
        </View>

        {/* 인사말 */}
        <View className="px-5 py-4 bg-guardian-bg-secondary">
          <Text className="text-lg font-extrabold text-guardian-text-primary">
            안녕하세요, 보호자님{" "}
            <Text className="text-guardian-text-secondary">♥</Text>
          </Text>
          <Text className="text-xs text-guardian-text-neutral mt-1">
            {displayPatient} 님의 돌봄 기록 · {recordMeta.syncHint || "실시간 반영 중"}
          </Text>
          {!!recordMeta.documentStatus && (
            <Text className="text-xs text-guardian-text-neutral mt-1 opacity-80">
              {statusDocLabel(recordMeta.documentStatus)}
            </Text>
          )}
        </View>

        {bootLoading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#FCC101" />
            <Text className="mt-3 text-xs text-guardian-text-neutral">체크리스트 불러오는 중…</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FCC101" />
            }
          >
            <StatusCard summary={summary} dateLine={dateLine} />
            <FilterTabs value={filter} onChange={setFilter} />

            {/* 1. 식사 */}
            <View className="bg-background-neutral mx-5 mt-4 rounded-2xl p-4 mb-2">
              <SectionHeader num={1} icon="🍴" title="식사" time={sectionTime} />
              <GridColumnHeader columns={MEAL_SLOTS.map((s) => s.label)} />
              {MEAL_ROWS.map((row) => (
                <GridRow
                  key={row.key}
                  label={row.label}
                  filter={filter}
                  states={MEAL_SLOTS.map((slot) => {
                    const cell  = state.meal[slot.key][row.key];
                    const level = cellDisplayLevel(cell);
                    return { level, onPress: () => openCellDetail(`${row.label} · ${slot.label}`, row.icon, cell) };
                  })}
                />
              ))}
            </View>

            {/* 2. 위생 */}
            <View className="bg-background-neutral mx-5 mt-4 rounded-2xl p-4 mb-2">
              <SectionHeader num={2} icon="🧼" title="위생·청결" time={sectionTime} />
              <Row label="침구류 청결도"  level={cellDisplayLevel(state.hygiene.bedding)}      filter={filter} onDetailPress={() => openCellDetail("침구류 청결도",  "🧼", state.hygiene.bedding)} />
              <Row label="환자 용품 청결" level={cellDisplayLevel(state.hygiene.patientItems)} filter={filter} onDetailPress={() => openCellDetail("환자 용품 청결", "🧴", state.hygiene.patientItems)} />
              <Row label="목욕 여부"      level={cellDisplayLevel(state.hygiene.bathing)}      filter={filter} onDetailPress={() => openCellDetail("목욕 여부",      "🛁", state.hygiene.bathing)} />
            </View>

            {/* 3. 상태 */}
            <View className="bg-background-neutral mx-5 mt-4 rounded-2xl p-4 mb-2">
              <SectionHeader num={3} icon="🛡️" title="상태 안전" time={sectionTime} />
              <Row label="호흡 양상" level={cellDisplayLevel(state.condition.breathing)} filter={filter} onDetailPress={() => openCellDetail("호흡 양상", "🫁", state.condition.breathing)} />
              <Row label="통증 유무" level={cellDisplayLevel(state.condition.pain)}      filter={filter} onDetailPress={() => openCellDetail("통증 유무", "🩹", state.condition.pain)} />
              <Row label="낙상 유무" level={cellDisplayLevel(state.condition.fall)}      filter={filter} onDetailPress={() => openCellDetail("낙상 유무", "⚠️", state.condition.fall)} />
            </View>

            {/* 4. 배뇨·배변 */}
            <View className="bg-background-neutral mx-5 mt-4 rounded-2xl p-4 mb-2">
              <SectionHeader num={4} icon="👣" title="배뇨 및 배변" time={sectionTime} />
              <MetaRow label="배뇨 (Urination)" meta={elimU.meta} level={elimU.level} filter={filter} onDetailPress={() => openElimDetail("배뇨 (Urination)", "💧", elimU)} />
              <MetaRow label="배변 (Defecation)" meta={elimD.meta} level={elimD.level} filter={filter} onDetailPress={() => openElimDetail("배변 (Defecation)", "🚻", elimD)} />
            </View>

            {/* 5. 특이사항 */}
            <View className="bg-background-neutral mx-5 mt-4 rounded-2xl p-4 mb-2">
              <SectionHeader num={5} icon="📝" title="특이사항" time={sectionTime} />
              <Text className="text-sm text-guardian-text-neutral leading-6 bg-guardian-bg-secondary p-3 rounded-xl">
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