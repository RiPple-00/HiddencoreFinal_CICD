// 요양사 앱에서 보호자가 실시간으로 환자 상태를 확인할 수 있는 페이지

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import {
  fetchGuardianLatestCareChecklist,
  fetchGuardianLinkedPatients,
} from "../../api/careChecklistApi";
import { buildDefaultChecklist, mergeChecklistFromServer } from "../../utils/careChecklistModel";
import { G, GMuted, GMutedLight, GBorder, GInkSoft } from "../../styles/guardianTheme";

function ReadOnlyRow({ label, abnormal, warnText }) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.rowLeft}>
        <Text style={[rowStyles.rowLabel, abnormal && { color: G.errorPrimary }]}>{label}</Text>
        {warnText ? <Text style={rowStyles.rowSubWarn}>{warnText}</Text> : null}
      </View>
      <View style={rowStyles.stateWrap}>
        <View style={[rowStyles.stateBtn, rowStyles.stateBtnSpacer, !abnormal && rowStyles.stateBtnActive]}>
          <Text style={[rowStyles.stateText, !abnormal && rowStyles.stateTextActive]}>정상</Text>
        </View>
        <View style={[rowStyles.stateBtn, abnormal && rowStyles.stateBtnDanger]}>
          <Text style={[rowStyles.stateText, abnormal && rowStyles.stateTextDanger]}>이상</Text>
        </View>
      </View>
    </View>
  );
}

function formatWhen(iso) {
  if (iso == null) return "";
  const s = typeof iso === "string" ? iso : String(iso);
  return s.replace("T", " ").slice(0, 16);
}

export default function LiveCheckPage() {
  const [linked, setLinked] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [model, setModel] = useState(buildDefaultChecklist());
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoadingPatients(true);
          setError(null);
          const res = await fetchGuardianLinkedPatients();
          if (cancelled) return;
          const list = res.data ?? [];
          setLinked(list);
          setPatientId((prev) => {
            if (prev != null) return prev;
            const primary = list.find((p) => p.primary) ?? list[0];
            return primary ? primary.patientId : null;
          });
        } catch (e) {
          if (!cancelled) {
            setError(e?.response?.data?.message ?? "연결된 환자 정보를 불러오지 못했습니다. 다시 로그인해 주세요.");
          }
        } finally {
          if (!cancelled) setLoadingPatients(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (patientId == null) return undefined;
      let cancelled = false;

      const tick = async () => {
        try {
          setRefreshing(true);
          const res = await fetchGuardianLatestCareChecklist(patientId);
          if (cancelled) return;
          setError(null);
          if (res.status === 204) {
            setMeta(null);
            setModel(buildDefaultChecklist());
            return;
          }
          setMeta(res.data);
          setModel(mergeChecklistFromServer(buildDefaultChecklist(), res.data.checklist));
        } catch (e) {
          if (!cancelled) {
            setError(e?.response?.data?.message ?? "체크리스트를 불러오지 못했습니다.");
          }
        } finally {
          if (!cancelled) setRefreshing(false);
        }
      };

      tick();
      const id = setInterval(tick, 5000);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }, [patientId])
  );

  const activePatient = linked.find((p) => p.patientId === patientId);

  return (
    <SafeAreaView style={pageStyles.safe} edges={["bottom", "left", "right"]}>
      <View style={pageStyles.topBar}>
        <Text style={pageStyles.title}>실시간 요양 체크</Text>
        {refreshing ? <ActivityIndicator size="small" color={G.textSecondary} /> : null}
      </View>

      {loadingPatients ? (
        <View style={pageStyles.center}>
          <ActivityIndicator size="large" color={G.textSecondary} />
          <Text style={pageStyles.muted}>연결 환자 확인 중…</Text>
        </View>
      ) : null}

      {!loadingPatients && !patientId ? (
        <View style={pageStyles.center}>
          <Text style={pageStyles.errorText}>
            {error ?? "이 계정에 연결된 환자가 없습니다. 시설에서 보호자 연동을 확인해 주세요."}
          </Text>
        </View>
      ) : null}

      {patientId ? (
        <ScrollView contentContainerStyle={pageStyles.scroll}>
          {linked.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={pageStyles.tabs}>
              {linked.map((p) => (
                <TouchableOpacity
                  key={p.patientId}
                  onPress={() => setPatientId(p.patientId)}
                  style={[pageStyles.tab, patientId === p.patientId && pageStyles.tabActive]}
                >
                  <Text style={[pageStyles.tabText, patientId === p.patientId && pageStyles.tabTextActive]}>
                    {p.patientName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          <View style={pageStyles.patientStrip}>
            <Text style={pageStyles.patientName}>{activePatient?.patientName ?? "환자"}</Text>
            <Text style={pageStyles.muted}>
              {meta?.recordedByName
                ? `최근 기록: ${meta.recordedByName} · ${formatWhen(meta.updatedAt)}`
                : "아직 요양사 기록이 없습니다."}
            </Text>
          </View>

          {error ? (
            <View style={pageStyles.banner}>
              <Text style={pageStyles.bannerText}>{error}</Text>
            </View>
          ) : null}

          {model.sections.map((section) => (
            <View key={section.id} style={pageStyles.section}>
              <Text style={pageStyles.sectionTitle}>{section.title}</Text>
              <View style={pageStyles.card}>
                {section.rows.map((r) => (
                  <ReadOnlyRow
                    key={r.key}
                    label={r.label}
                    abnormal={r.abnormal}
                    warnText={r.key === "breathing" && r.abnormal ? "체크 확인 필요" : undefined}
                  />
                ))}
                {section.id === "condition" && model.memo ? (
                  <View style={pageStyles.memoBox}>
                    <Text style={pageStyles.memoLabel}>상세 메모</Text>
                    <Text style={pageStyles.memoBody}>{model.memo}</Text>
                  </View>
                ) : null}
              </View>
              
            </View>
            
          ))}

          <Text style={pageStyles.hint}>5초마다 자동 새로고침됩니다.</Text>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const pageStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.bgSecondary },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: G.backgroundNeutral,
    borderBottomWidth: 1,
    borderBottomColor: GBorder,
  },
  title: { fontSize: 18, fontWeight: "800", color: G.textPrimary },
  scroll: { paddingBottom: 32, paddingHorizontal: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  muted: { marginTop: 6, fontSize: 13, color: GMuted },
  errorText: { textAlign: "center", color: G.errorPrimary, fontSize: 15 },
  banner: {
    backgroundColor: G.errorSecondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  bannerText: { color: G.errorPrimary, fontSize: 13 },
  tabs: { marginVertical: 8, maxHeight: 44 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: G.buttonSecondary,
    marginRight: 8,
  },
  tabActive: { backgroundColor: G.buttonPrimary },
  tabText: { fontSize: 14, color: GMuted, fontWeight: "600" },
  tabTextActive: { color: G.textPrimary },
  patientStrip: {
    backgroundColor: G.bgSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GBorder,
  },
  patientName: { fontSize: 20, fontWeight: "700", color: GInkSoft },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: G.textPrimary, marginBottom: 6 },
  card: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: GBorder,
  },
  memoBox: { padding: 12, borderTopWidth: 1, borderTopColor: GBorder },
  memoLabel: { fontSize: 12, color: GMuted, marginBottom: 4 },
  memoBody: { fontSize: 14, color: GInkSoft, lineHeight: 20 },
  hint: { textAlign: "center", marginTop: 16, fontSize: 12, color: GMutedLight },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: G.buttonSecondary,
  },
  rowLeft: { flex: 1, paddingRight: 8 },
  rowLabel: { fontSize: 14, color: G.textPrimary, fontWeight: "600" },
  rowSubWarn: { fontSize: 11, color: G.errorPrimary, marginTop: 2 },
  stateWrap: { flexDirection: "row" },
  stateBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: G.buttonSecondary,
  },
  stateBtnSpacer: { marginRight: 6 },
  stateBtnActive: { backgroundColor: G.successSecondary },
  stateBtnDanger: { backgroundColor: G.errorSecondary },
  stateText: { fontSize: 12, color: GMuted, fontWeight: "600" },
  stateTextActive: { color: G.successPrimary },
  stateTextDanger: { color: G.errorPrimary },
});
