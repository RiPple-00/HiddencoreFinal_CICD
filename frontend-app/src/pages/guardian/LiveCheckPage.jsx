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
import { useI18n } from "@/hooks/useI18n";
import CaregiverConditionRow from "../../components/caregiver/CaregiverConditionRow";
import CaregiverEliminationCard from "../../components/caregiver/CaregiverEliminationCard";
import CaregiverHygieneRow from "../../components/caregiver/CaregiverHygieneRow";
import CaregiverMealCheckTable from "../../components/caregiver/CaregiverMealCheckTable";
import CaregiverSectionCard from "../../components/caregiver/CaregiverSectionCard";
import { G, GMuted, GMutedLight, GBorder, GInkSoft } from "../../styles/guardianTheme";

function formatTodayDate(todayLabel) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day} (${todayLabel})`;
}

function formatLastRecordTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function LiveCheckPage() {
  const { t } = useI18n();
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
            setError(e?.response?.data?.message ?? t('live.error_patients'));
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
            setError(e?.response?.data?.message ?? t('live.error_checklist'));
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
        <Text style={pageStyles.title}>{t('live.title')}</Text>
        {refreshing ? <ActivityIndicator size="small" color={G.textSecondary} /> : null}
      </View>

      {loadingPatients ? (
        <View style={pageStyles.center}>
          <ActivityIndicator size="large" color={G.textSecondary} />
          <Text style={pageStyles.muted}>{t('live.loading_patients')}</Text>
        </View>
      ) : null}

      {!loadingPatients && !patientId ? (
        <View style={pageStyles.center}>
          <Text style={pageStyles.errorText}>
            {error ?? t('live.no_patient')}
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
                <Text style={pageStyles.elderLabel}>{t('live.elder_label')}</Text>
              </View>

              {/* 날짜 뱃지 */}
              <View style={pageStyles.infoBadge}>
                <Text style={pageStyles.infoBadgeText}>📅  {formatTodayDate(t('live.today_label'))}</Text>
              </View>

              {/* 마지막 기록 시간 뱃지 */}
              {lastRecordTime ? (
                <View style={[pageStyles.infoBadge, pageStyles.infoBadgeGap]}>
                  <Text style={pageStyles.infoBadgeText}>🕐  {t('live.last_record_prefix')}{lastRecordTime}</Text>
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
                  {isSubmitted ? t('live.status_done') : isRecording ? t('live.status_recording') : t('live.status_idle')}
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

          <CaregiverSectionCard icon="🍴" title={t('live.section_meal')} theme="guardian">
            <CaregiverMealCheckTable value={state.meal} onChange={noop} readOnly theme="guardian" />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="🧼" title={t('live.section_hygiene')} theme="guardian">
            <CaregiverHygieneRow label={t('live.hygiene_bedding')} value={state.hygiene.bedding} onChange={noop} readOnly theme="guardian" />
            <CaregiverHygieneRow label={t('live.hygiene_patient_items')} value={state.hygiene.patientItems} onChange={noop} readOnly theme="guardian" />
            <CaregiverHygieneRow label={t('live.hygiene_bathing')} value={state.hygiene.bathing} onChange={noop} readOnly theme="guardian" isLast />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="🛡️" title={t('live.section_condition')} theme="guardian">
            <CaregiverConditionRow
              label={t('live.condition_breathing')}
              value={state.condition.breathing}
              onChange={noop}
              warnText={state.condition.breathing.status === "abnormal" ? t('live.condition_warn') : null}
              readOnly
              theme="guardian"
            />
            <CaregiverConditionRow label={t('live.condition_pain')} value={state.condition.pain} onChange={noop} readOnly theme="guardian" />
            <CaregiverConditionRow label={t('live.condition_fall')} value={state.condition.fall} onChange={noop} readOnly theme="guardian" isLast />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="👣" title={t('live.section_elimination')} theme="guardian">
            <CaregiverEliminationCard icon="💧" label={t('live.elimination_urination')} value={state.elimination.urination} onChange={noop} readOnly theme="guardian" />
            <CaregiverEliminationCard icon="🚻" label={t('live.elimination_defecation')} value={state.elimination.defecation} onChange={noop} readOnly theme="guardian" isLast />
          </CaregiverSectionCard>

          <CaregiverSectionCard icon="📝" title={t('live.section_notes')} theme="guardian">
            <View className="p-3">
              <Text className="text-[13px] text-caregiver-text-primary leading-5">
                {state.specialNotes?.trim() ? state.specialNotes : "—"}
              </Text>
            </View>
          </CaregiverSectionCard>

          <Text style={pageStyles.hint}>{t('live.hint')}</Text>
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
