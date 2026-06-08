// 요양사가 작성하는 일일 업무 체크리스트(CARE_CHECK)를 보호자가 실시간으로 확인

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Text from "@/components/Text";

import { fetchGuardianCareCheck, fetchGuardianLinkedPatients } from "../../api/careChecklistApi";
import {
  resolveGuardianPatientDisplayName,
  resolveGuardianPrimaryPatientId,
} from "../../utils/guardianPatientId";
import { applyResponseToState, initialState, todayStr } from "../../utils/careCheckState";
import CaregiverConditionRow from "../../components/caregiver/CaregiverConditionRow";
import CaregiverEliminationCard from "../../components/caregiver/CaregiverEliminationCard";
import CaregiverHygieneRow from "../../components/caregiver/CaregiverHygieneRow";
import CaregiverMealCheckTable from "../../components/caregiver/CaregiverMealCheckTable";
import CaregiverSectionCard from "../../components/caregiver/CaregiverSectionCard";
import { G, GMuted, GMutedLight, GBorder, GInkSoft } from "../../styles/guardianTheme";

function formatTodayDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day} (오늘)`;
}

function formatLastRecordTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function LiveCheckPage() {
  const [linked, setLinked] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [state, setState] = useState(initialState);
  const [careMeta, setCareMeta] = useState(null);
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
            return resolveGuardianPrimaryPatientId(list);
          });
        } catch (e) {
          if (!cancelled) {
            setError(e?.response?.data?.message ?? "연결된 환자 정보를 불러오지 못했습니다. 다시 로그인해 주세요.");
          }
        } finally {
          if (!cancelled) setLoadingPatients(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (patientId == null) return undefined;
      let cancelled = false;

      const tick = async () => {
        try {
          setRefreshing(true);
          const res = await fetchGuardianCareCheck(patientId, todayStr());
          if (cancelled) return;
          setError(null);
          setCareMeta(res.data ?? null);
          setState(applyResponseToState(res.data));
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
      return () => { cancelled = true; clearInterval(id); };
    }, [patientId])
  );

  const activePatient = linked.find((p) => p.patientId === patientId);
  const noop = () => {};
  const lastRecordTime = formatLastRecordTime(careMeta?.updatedAt);
  const isSubmitted = careMeta?.status === "PENDING_APPROVAL" || careMeta?.status === "APPROVED";
  const isRecording = careMeta != null && !isSubmitted;

  return (
    <SafeAreaView style={pageStyles.safe} edges={["bottom", "left", "right"]}>
      {/* 상단 타이틀 바 */}
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
        <ScrollView contentContainerStyle={pageStyles.scroll} showsVerticalScrollIndicator={false}>
          {/* 환자 탭 (다중 연결 시) */}
          {linked.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={pageStyles.tabs}>
              {linked.map((p) => (
                <TouchableOpacity
                  key={p.patientId}
                  onPress={() => setPatientId(p.patientId)}
                  style={[pageStyles.tab, patientId === p.patientId && pageStyles.tabActive]}
                >
                  <Text style={[pageStyles.tabText, patientId === p.patientId && pageStyles.tabTextActive]}>
                    {resolveGuardianPatientDisplayName(p.patientId, p.patientName)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          {/* ─── 환자 정보 카드 ─── */}
          <View style={pageStyles.patientCard}>
            {/* 아바타 */}
            <View style={pageStyles.avatarWrap}>
              <Text style={pageStyles.avatarEmoji}>👵</Text>
            </View>

            {/* 중앙 정보 */}
            <View style={pageStyles.patientInfo}>
              {/* 이름 + 어르신 */}
              <View style={pageStyles.nameRow}>
                <Text style={pageStyles.patientName}>
                  {resolveGuardianPatientDisplayName(
                    patientId,
                    activePatient?.patientName ?? careMeta?.patientName
                  )}
                </Text>
                <Text style={pageStyles.elderLabel}>어르신</Text>
              </View>

              {/* 날짜 뱃지 */}
              <View style={pageStyles.infoBadge}>
                <Text style={pageStyles.infoBadgeText}>📅  {formatTodayDate()}</Text>
              </View>

              {/* 마지막 기록 시간 뱃지 */}
              {lastRecordTime ? (
                <View style={[pageStyles.infoBadge, pageStyles.infoBadgeGap]}>
                  <Text style={pageStyles.infoBadgeText}>🕐  마지막 기록 {lastRecordTime}</Text>
                </View>
              ) : null}
            </View>

            {/* 우측: 기록 상태 + 하트 */}
            <View style={pageStyles.rightCol}>
              <View style={[
                pageStyles.statusBadge,
                isSubmitted ? pageStyles.statusDone
                  : isRecording ? pageStyles.statusActive
                  : pageStyles.statusIdle,
              ]}>
                <Text style={[pageStyles.statusText, {
                  color: isSubmitted ? G.textPrimary
                    : isRecording ? G.successPrimary
                    : GMuted,
                }]}>
                  {isSubmitted ? "✓ 기록 완료" : isRecording ? "● 기록 중" : "● 대기 중"}
                </Text>
              </View>
              <Text style={pageStyles.heartIcon}>🩶</Text>
            </View>
          </View>
          {/* ─── 카드 끝 ─── */}

          {error ? (
            <View style={pageStyles.banner}>
              <Text style={pageStyles.bannerText}>{error}</Text>
            </View>
          ) : null}

          <CaregiverSectionCard icon="🍴" title="식사 (Meal)" theme="guardian">
            <CaregiverMealCheckTable value={state.meal} onChange={noop} readOnly theme="guardian" />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="🧼" title="위생점검 (Hygiene)" theme="guardian">
            <CaregiverHygieneRow label="침구류 청결도" value={state.hygiene.bedding} onChange={noop} readOnly theme="guardian" />
            <CaregiverHygieneRow label="환자 용품 청결" value={state.hygiene.patientItems} onChange={noop} readOnly theme="guardian" />
            <CaregiverHygieneRow label="목욕 여부" value={state.hygiene.bathing} onChange={noop} readOnly theme="guardian" isLast />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="🛡️" title="상태 안정화 (Condition)" theme="guardian">
            <CaregiverConditionRow
              label="호흡 양상"
              value={state.condition.breathing}
              onChange={noop}
              warnText={state.condition.breathing.status === "abnormal" ? "최근 확인 필요" : null}
              readOnly
              theme="guardian"
            />
            <CaregiverConditionRow label="통증 유무" value={state.condition.pain} onChange={noop} readOnly theme="guardian" />
            <CaregiverConditionRow label="낙상 유무" value={state.condition.fall} onChange={noop} readOnly theme="guardian" isLast />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="👣" title="배뇨 및 배변" theme="guardian">
            <CaregiverEliminationCard icon="💧" label="배뇨 (Urination)" value={state.elimination.urination} onChange={noop} readOnly theme="guardian" />
            <CaregiverEliminationCard icon="🚻" label="배변 (Defecation)" value={state.elimination.defecation} onChange={noop} readOnly theme="guardian" isLast />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="📝" title="특이사항" theme="guardian">
            <View className="p-3">
              <Text className="text-[13px] text-caregiver-text-primary leading-5">
                {state.specialNotes?.trim() ? state.specialNotes : "—"}
              </Text>
            </View>
          </CaregiverSectionCard>

          <Text style={pageStyles.hint}>5초마다 자동 새로고침됩니다. (요양사 자동 저장 반영)</Text>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const pageStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.bgSecondary },

  /* 타이틀 바 */
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

  scroll: { paddingBottom: 32, paddingHorizontal: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  muted: { marginTop: 6, fontSize: 13, color: GMuted },
  errorText: { textAlign: "center", color: G.errorPrimary, fontSize: 15 },

  banner: {
    backgroundColor: G.errorSecondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 10,
  },
  bannerText: { color: G.errorPrimary, fontSize: 13 },

  tabs: { marginVertical: 8, maxHeight: 44, paddingHorizontal: 10 },
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

  /* ─── 환자 정보 카드 ─── */
  patientCard: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: GBorder,
    flexDirection: "row",
    alignItems: "stretch",
  },

  /* 아바타 */
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F5EFE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    alignSelf: "center",
  },
  avatarEmoji: { fontSize: 34 },

  /* 중앙 텍스트 영역 */
  patientInfo: { flex: 1 },

  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  patientName: { fontSize: 20, fontWeight: "700", color: GInkSoft, marginRight: 6 },
  elderLabel: { fontSize: 13, color: GMuted, fontWeight: "500" },

  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: G.bgSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  infoBadgeGap: { marginTop: 5 },
  infoBadgeText: { fontSize: 12, color: GMuted, fontWeight: "500" },

  /* 우측 컬럼 */
  rightCol: {
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDone:   { backgroundColor: G.buttonSecondary },   // 노랑 크림: 완료
  statusActive: { backgroundColor: G.successSecondary },  // 연초록: 기록 중
  statusIdle:   { backgroundColor: G.bgSecondary },       // 뉴트럴: 대기
  statusText: { fontSize: 12, fontWeight: "700" },

  heartIcon: { fontSize: 22 },

  hint: { textAlign: "center", marginTop: 16, fontSize: 12, color: GMutedLight, paddingHorizontal: 12 },
});
