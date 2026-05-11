import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import caregiverApi from "../../api/caregiverApi";
import {
  applyResponseToState,
  buildPayload,
  initialState,
  todayStr,
} from "../../utils/careCheckState";
import CaregiverBottomNav from "../../components/caregiver/CaregiverBottomNav";
import CaregiverConditionRow from "../../components/caregiver/CaregiverConditionRow";
import CaregiverEliminationCard from "../../components/caregiver/CaregiverEliminationCard";
import CaregiverHeader from "../../components/caregiver/CaregiverHeader";
import CaregiverHygieneRow from "../../components/caregiver/CaregiverHygieneRow";
import CaregiverMealCheckTable from "../../components/caregiver/CaregiverMealCheckTable";
import CaregiverPatientStrip from "../../components/caregiver/CaregiverPatientStrip";
import CaregiverSectionCard from "../../components/caregiver/CaregiverSectionCard";

// =============================================================
// 메인 페이지
// =============================================================
export default function CaregiverTaskCheckPage({ navigation, route }) {
  // route 파라미터로 환자 정보를 받을 수 있게 하되, 없으면 디자인의 더미값을 사용한다.
  const params = route?.params ?? {};
  const patientId = params.patientId ?? 1;
  const patientName = params.patientName ?? "김따숨";
  const genderAge = params.genderAge ?? "M/82";
  const metaItems = params.metaItems ?? ["441212", "Ward 402", "72283944"];
  const recordDate = params.recordDate ?? todayStr();

  const [state, setState] = useState(initialState);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [submitting, setSubmitting] = useState(false);

  // 자동 저장: state 가 바뀌면 1.5초 디바운스 후 백엔드에 PUT.
  const debounceRef = useRef(null);
  const isMountedRef = useRef(true);
  const bootstrappedRef = useRef(false);

  // 1) 마운트 시 기존 저장본 로딩
  useEffect(() => {
    let cancelled = false;
    isMountedRef.current = true;
    (async () => {
      try {
        const { data } = await caregiverApi.getOne({
          patientId,
          date: recordDate,
        });
        if (cancelled) return;
        const next = applyResponseToState(data);
        setState(next);
      } catch (err) {
        // 네트워크 오류 등 - 빈 상태로 시작한다 (사용자에게 별도 알림은 띄우지 않음)
        if (cancelled) return;
        setState(initialState());
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
          // 다음 tick 부터 자동 저장이 동작하도록 표시
          setTimeout(() => {
            bootstrappedRef.current = true;
          }, 0);
        }
      }
    })();

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [patientId, recordDate]);

  // 2) state 변경 시 자동 저장(디바운스)
  useEffect(() => {
    if (!bootstrappedRef.current) return; // 초기 로딩 직후의 setState 는 무시
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSaveStatus("saving");
    debounceRef.current = setTimeout(async () => {
      try {
        await caregiverApi.autoSave(buildPayload(state, patientId, recordDate));
        if (isMountedRef.current) setSaveStatus("saved");
      } catch (err) {
        if (isMountedRef.current) setSaveStatus("error");
      }
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, patientId, recordDate]);

  // ---------- 부분 업데이트 헬퍼 ----------
  const updateMeal = useCallback((nextMeal) => {
    setState((prev) => ({ ...prev, meal: nextMeal }));
  }, []);

  const updateHygieneItem = useCallback((key, nextValue) => {
    setState((prev) => ({
      ...prev,
      hygiene: { ...prev.hygiene, [key]: nextValue },
    }));
  }, []);

  const updateConditionItem = useCallback((key, nextValue) => {
    setState((prev) => ({
      ...prev,
      condition: { ...prev.condition, [key]: nextValue },
    }));
  }, []);

  const updateElimItem = useCallback((key, nextValue) => {
    setState((prev) => ({
      ...prev,
      elimination: { ...prev.elimination, [key]: nextValue },
    }));
  }, []);

  const updateSpecialNotes = useCallback((text) => {
    setState((prev) => ({ ...prev, specialNotes: text }));
  }, []);

  // ---------- 제출 ----------
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // 마지막 입력이 디바운스를 안 거치고 끝났을 수도 있으므로 즉시 저장 후 제출.
      const payload = buildPayload(state, patientId, recordDate);
      await caregiverApi.autoSave(payload);
      await caregiverApi.submit(payload);
      Alert.alert("제출 완료", "오늘의 업무 체크리스트가 제출되었습니다.");
      setSaveStatus("saved");
    } catch (err) {
      Alert.alert("제출 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, [state, patientId, recordDate, submitting]);

  // ---------- 자동 저장 상태 표시 텍스트 ----------
  const saveStatusText = useMemo(() => {
    if (saveStatus === "saving") return "자동 저장 중…";
    if (saveStatus === "saved") return "자동 저장됨";
    if (saveStatus === "error") return "자동 저장 실패";
    return "";
  }, [saveStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CaregiverHeader onBack={() => navigation?.goBack?.()} />
        <CaregiverPatientStrip
          name={patientName}
          genderAge={genderAge}
          metaItems={metaItems}
        />

        {/* 자동 저장 상태 표시 */}
        <View style={styles.autosaveBar}>
          <Text style={styles.autosaveText}>
            {bootstrapping ? "이전 기록 불러오는 중…" : saveStatusText}
          </Text>
        </View>

        {bootstrapping ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color="#1E3A66" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 식사 (Meal) */}
            <CaregiverSectionCard icon="🍴" title="식사 (Meal)">
              <CaregiverMealCheckTable value={state.meal} onChange={updateMeal} />
            </CaregiverSectionCard>

            {/* 위생점검 (Hygiene) */}
            <CaregiverSectionCard icon="🧼" title="위생점검 (Hygiene)">
              <CaregiverHygieneRow
                label="침구류 청결도"
                value={state.hygiene.bedding}
                onChange={(v) => updateHygieneItem("bedding", v)}
              />
              <CaregiverHygieneRow
                label="환자 용품 청결"
                value={state.hygiene.patientItems}
                onChange={(v) => updateHygieneItem("patientItems", v)}
              />
              <CaregiverHygieneRow
                label="목욕 여부"
                value={state.hygiene.bathing}
                onChange={(v) => updateHygieneItem("bathing", v)}
                isLast
              />
            </CaregiverSectionCard>

            {/* 상태 안정화 (Condition) */}
            <CaregiverSectionCard icon="🛡️" title="상태 안정화 (Condition)">
              <CaregiverConditionRow
                label="호흡 양상"
                value={state.condition.breathing}
                onChange={(v) => updateConditionItem("breathing", v)}
                warnText={
                  state.condition.breathing.status === "abnormal"
                    ? "최근 확인 필요"
                    : null
                }
              />
              <CaregiverConditionRow
                label="통증 유무"
                value={state.condition.pain}
                onChange={(v) => updateConditionItem("pain", v)}
              />
              <CaregiverConditionRow
                label="낙상 유무"
                value={state.condition.fall}
                onChange={(v) => updateConditionItem("fall", v)}
                isLast
              />
            </CaregiverSectionCard>

            {/* 배뇨 및 배변 */}
            <CaregiverSectionCard icon="👣" title="배뇨 및 배변">
              <CaregiverEliminationCard
                icon="💧"
                label="배뇨 (Urination)"
                value={state.elimination.urination}
                onChange={(v) => updateElimItem("urination", v)}
              />
              <CaregiverEliminationCard
                icon="🚻"
                label="배변 (Defecation)"
                value={state.elimination.defecation}
                onChange={(v) => updateElimItem("defecation", v)}
                isLast
              />
            </CaregiverSectionCard>

            {/* 특이사항 */}
            <CaregiverSectionCard icon="📝" title="특이사항">
              <View style={{ padding: 12 }}>
                <TextInput
                  value={state.specialNotes ?? ""}
                  onChangeText={updateSpecialNotes}
                  placeholder="특이사항을 입력하세요"
                  placeholderTextColor="#A6B0C0"
                  style={styles.specialNotesInput}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </CaregiverSectionCard>

            {/* 제출하기 버튼 */}
            <View style={styles.submitWrap}>
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              >
                <Text style={styles.submitText}>
                  {submitting ? "제출 중…" : "제출하기"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        <CaregiverBottomNav
          active="qr"
          onPressHome={() => navigation?.navigate?.("CaregiverMain")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "#F4F6F8",
  },
  autosaveBar: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 2,
  },
  autosaveText: {
    fontSize: 11,
    color: "#7A8BA2",
    textAlign: "right",
  },
  loadingBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  specialNotesInput: {
    borderWidth: 1,
    borderColor: "#E1E6EF",
    borderRadius: 8,
    backgroundColor: "#FAFCFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 70,
    fontSize: 13,
    color: "#1B2A3A",
  },
  submitWrap: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 8,
  },
  submitBtn: {
    backgroundColor: "#2D6FE0",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#94B0DD",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
