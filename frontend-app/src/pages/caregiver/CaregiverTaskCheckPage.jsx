import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable,
  ScrollView, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/Text";

import caregiverApi from "../../api/caregiverApi";
import {
  applyResponseToState,
  buildPayload,
  hasBlockingAbnormalMemo,
  initialState,
  isRequiredChecklistComplete,
  todayStr,
} from "../../utils/careCheckState";
import CaregiverConditionRow   from "../../components/caregiver/CaregiverConditionRow";
import CaregiverEliminationCard from "../../components/caregiver/CaregiverEliminationCard";
import CaregiverHygieneRow     from "../../components/caregiver/CaregiverHygieneRow";
import CaregiverMealCheckTable from "../../components/caregiver/CaregiverMealCheckTable";
import CaregiverPatientStrip   from "../../components/caregiver/CaregiverPatientStrip";
import CaregiverSectionCard    from "../../components/caregiver/CaregiverSectionCard";

// =============================================================
// 메인 페이지
// =============================================================
export default function CaregiverTaskCheckPage({ navigation, route }) {
  // route 파라미터로 환자 정보를 받을 수 있게 하되, 없으면 디자인의 더미값을 사용한다.
  const params      = route?.params ?? {};
  const patientId   = params.patientId   ?? 1;
  const patientName = params.patientName ?? "김따숨";
  const genderAge   = params.genderAge   ?? "M/82";
  const metaItems   = params.metaItems   ?? ["441212", "Ward 402", "72283944"];
  const recordDate  = params.recordDate  ?? todayStr();

  const [state,        setState]        = useState(initialState);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [saveStatus,   setSaveStatus]   = useState("idle"); // idle | saving | saved | error
  const [submitting,   setSubmitting]   = useState(false);
  const [submitErrors, setSubmitErrors] = useState(null); // { mealMap, hygieneMap, conditionMap, sections }
  const [submitBanner, setSubmitBanner] = useState(null); // { type: 'warning'|'success', message }
  const [recordStatus, setRecordStatus] = useState(null); // DRAFT | PENDING_APPROVAL 등

  const scrollRef = useRef(null);
  const sectionYRef = useRef({ meal: 0, hygiene: 0, condition: 0 });

  // 자동 저장: state 가 바뀌면 1.5초 디바운스 후 백엔드에 PUT.
  const debounceRef      = useRef(null);
  const isMountedRef     = useRef(true);
  const bootstrappedRef  = useRef(false);

  // 1) 마운트 시 기존 저장본 로딩
  useEffect(() => {
    let cancelled = false;
    isMountedRef.current = true;
    (async () => {
      try {
        const { data } = await caregiverApi.getOne({ patientId, date: recordDate });
        if (cancelled) return;
        setState(applyResponseToState(data));
        setRecordStatus(data?.status ?? null);
      } catch {
        // 네트워크 오류 등 - 빈 상태로 시작한다 (사용자에게 별도 알림은 띄우지 않음)
        if (cancelled) return;
        setState(initialState());
        setRecordStatus(null);
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
          // 다음 tick 부터 자동 저장이 동작하도록 표시
          setTimeout(() => { bootstrappedRef.current = true; }, 0);
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

    if (hasBlockingAbnormalMemo(state)) {
      setSaveStatus("blocked");
      return;
    }

    setSaveStatus("saving");
    debounceRef.current = setTimeout(async () => {
      try {
        await caregiverApi.autoSave(buildPayload(state, patientId, recordDate));
        if (isMountedRef.current) setSaveStatus("saved");
      } catch {
        if (isMountedRef.current) setSaveStatus("error");
      }
    }, 1500);
  }, [state, patientId, recordDate]);

  const updateMeal          = useCallback((v) => setState((p) => ({ ...p, meal: v })), []);
  const updateHygieneItem   = useCallback((k, v) => setState((p) => ({ ...p, hygiene:    { ...p.hygiene,    [k]: v } })), []);
  const updateConditionItem = useCallback((k, v) => setState((p) => ({ ...p, condition:  { ...p.condition,  [k]: v } })), []);
  const updateElimItem      = useCallback((k, v) => setState((p) => ({ ...p, elimination: { ...p.elimination, [k]: v } })), []);
  const updateSpecialNotes  = useCallback((text) => setState((p) => ({ ...p, specialNotes: text })), []);

  const computeSubmitErrors = useCallback((s) => {
    const mealMap = {};
    const hygieneMap = {};
    const conditionMap = {};

    const needStatus = (item) => item?.status !== "normal" && item?.status !== "abnormal";

    // meal 9 cells
    const slots = ["morning", "lunch", "dinner"];
    const rows = ["intake", "hydration", "incident"];
    slots.forEach((slot) => {
      rows.forEach((row) => {
        const cell = s?.meal?.[slot]?.[row];
        if (needStatus(cell)) {
          mealMap[`${slot}.${row}`] = true;
        }
      });
    });

    // hygiene 3
    ["bedding", "patientItems", "bathing"].forEach((k) => {
      if (needStatus(s?.hygiene?.[k])) hygieneMap[k] = true;
    });

    // condition 3
    ["breathing", "pain", "fall"].forEach((k) => {
      if (needStatus(s?.condition?.[k])) conditionMap[k] = true;
    });

    const sections = {
      meal: Object.keys(mealMap).length > 0,
      hygiene: Object.keys(hygieneMap).length > 0,
      condition: Object.keys(conditionMap).length > 0,
    };

    return { mealMap, hygieneMap, conditionMap, sections };
  }, []);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const scrollToFirstError = useCallback((sections) => {
    const yMap = sectionYRef.current || {};
    const order = ["meal", "hygiene", "condition"];
    const first = order.find((k) => sections?.[k]);
    if (!first) {
      scrollToTop();
      return;
    }
    const y = Math.max(0, (yMap[first] ?? 0) - 10);
    scrollRef.current?.scrollTo({ y, animated: true });
  }, [scrollToTop]);

  const clearRequiredSectionFeedback = useCallback(() => {
    setSubmitErrors(null);
    setSubmitBanner(null);
  }, []);

  const isSubmitted =
    recordStatus === "PENDING_APPROVAL" || recordStatus === "APPROVED";

  // ---------- 제출 ----------
  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const errs = computeSubmitErrors(state);
    if (errs.sections.meal || errs.sections.hygiene || errs.sections.condition) {
      setSubmitErrors(errs);
      setSubmitBanner({
        type: "warning",
        message: "기입이 되지 않은 항목들 작성해주시기 바랍니다.",
      });
      scrollToFirstError(errs.sections);
      return;
    }

    setSubmitting(true);
    setSubmitBanner(null);
    try {
      // 마지막 입력이 디바운스를 안 거치고 끝났을 수도 있으므로 즉시 저장 후 제출.
      const payload = buildPayload(state, patientId, recordDate);
      await caregiverApi.autoSave(payload);
      const { data } = await caregiverApi.submit(payload);
      setRecordStatus(data?.status ?? "PENDING_APPROVAL");
      setSubmitErrors(null);
      setSubmitBanner({
        type: "success",
        message: "제출이 완료되었습니다.",
      });
      setSaveStatus("saved");
      scrollToTop();
    } catch {
      Alert.alert("제출 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, [
    state,
    patientId,
    recordDate,
    submitting,
    computeSubmitErrors,
    scrollToFirstError,
    scrollToTop,
  ]);

  const saveStatusText = useMemo(() => {
    if (saveStatus === "saving") return "자동 저장 중…";
    if (saveStatus === "saved")  return "자동 저장됨";
    if (saveStatus === "error")  return "자동 저장 실패";
    if (saveStatus === "blocked") return "이상 사유를 입력해야 자동 저장됩니다";
    return "";
  }, [saveStatus]);

  return (
    <SafeAreaView className="flex-1 bg-caregiver-bg-primary" edges={["bottom", "left", "right"]}>
      {/* maxWidth 430은 NativeWind 불안정 → inline style 유지 */}
      <View className="flex-1 w-full self-center" style={{ maxWidth: 430 }}>

        <CaregiverPatientStrip name={patientName} genderAge={genderAge} metaItems={metaItems} />

        {submitBanner && (
          <View
            className={`mx-[14px] mt-2 rounded-lg border px-3 py-2.5 ${
              submitBanner.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <Text
              className={`text-[13px] font-semibold leading-5 ${
                submitBanner.type === "success"
                  ? "text-emerald-800"
                  : "text-amber-900"
              }`}
            >
              {submitBanner.message}
            </Text>
          </View>
        )}

        {isSubmitted && !submitBanner && (
          <View className="mx-[14px] mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <Text className="text-[13px] font-semibold text-emerald-800">
              제출이 완료되었습니다.
            </Text>
          </View>
        )}

        {/* 자동 저장 상태 표시 */}
        <View className="px-[14px] pt-2 pb-[2px]">
          <Text className="text-[11px] text-caregiver-text-secondary text-right">
            {bootstrapping
              ? "이전 기록 불러오는 중…"
              : isSubmitted
                ? "제출 완료 · 수정 시 자동 저장됩니다"
                : saveStatusText}
          </Text>
        </View>

        {bootstrapping ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#005E53" />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 식사 */}
            <View onLayout={(e) => { sectionYRef.current.meal = e.nativeEvent.layout.y; }}>
            <CaregiverSectionCard icon="🍴" title="식사 (Meal)">
              <CaregiverMealCheckTable
                value={state.meal}
                onChange={(v) => {
                  clearRequiredSectionFeedback();
                  updateMeal(v);
                }}
                statusErrorMap={submitErrors?.mealMap ?? null}
              />
            </CaregiverSectionCard>
            </View>

            {/* 위생점검 */}
            <View onLayout={(e) => { sectionYRef.current.hygiene = e.nativeEvent.layout.y; }}>
            <CaregiverSectionCard icon="🧼" title="위생점검 (Hygiene)">
              <CaregiverHygieneRow
                label="침구류 청결도"
                value={state.hygiene.bedding}
                onChange={(v) => { clearRequiredSectionFeedback(); updateHygieneItem("bedding", v); }}
                showStatusError={Boolean(submitErrors?.hygieneMap?.bedding)}
              />
              <CaregiverHygieneRow
                label="환자 용품 청결"
                value={state.hygiene.patientItems}
                onChange={(v) => { clearRequiredSectionFeedback(); updateHygieneItem("patientItems", v); }}
                showStatusError={Boolean(submitErrors?.hygieneMap?.patientItems)}
              />
              <CaregiverHygieneRow
                label="목욕 여부"
                value={state.hygiene.bathing}
                onChange={(v) => { clearRequiredSectionFeedback(); updateHygieneItem("bathing", v); }}
                showStatusError={Boolean(submitErrors?.hygieneMap?.bathing)}
                isLast
              />
            </CaregiverSectionCard>
            </View>

            {/* 상태 안정화 */}
            <View onLayout={(e) => { sectionYRef.current.condition = e.nativeEvent.layout.y; }}>
            <CaregiverSectionCard icon="🛡️" title="상태 안정화 (Condition)">
              <CaregiverConditionRow
                label="호흡 양상"
                value={state.condition.breathing}
                onChange={(v) => { clearRequiredSectionFeedback(); updateConditionItem("breathing", v); }}
                warnText={state.condition.breathing.status === "abnormal" ? "최근 확인 필요" : null}
                showStatusError={Boolean(submitErrors?.conditionMap?.breathing)}
              />
              <CaregiverConditionRow
                label="통증 유무"
                value={state.condition.pain}
                onChange={(v) => { clearRequiredSectionFeedback(); updateConditionItem("pain", v); }}
                showStatusError={Boolean(submitErrors?.conditionMap?.pain)}
              />
              <CaregiverConditionRow
                label="낙상 유무"
                value={state.condition.fall}
                onChange={(v) => { clearRequiredSectionFeedback(); updateConditionItem("fall", v); }}
                showStatusError={Boolean(submitErrors?.conditionMap?.fall)}
                isLast
              />
            </CaregiverSectionCard>
            </View>

            {/* 배뇨 및 배변 */}
            <CaregiverSectionCard icon="👣" title="배뇨 및 배변">
              <CaregiverEliminationCard icon="💧" label="배뇨 (Urination)"  value={state.elimination.urination}  onChange={(v) => updateElimItem("urination", v)} />
              <CaregiverEliminationCard icon="🚻" label="배변 (Defecation)" value={state.elimination.defecation} onChange={(v) => updateElimItem("defecation", v)} isLast />
            </CaregiverSectionCard>

            {/* 특이사항 */}
            <CaregiverSectionCard icon="📝" title="특이사항">
              <View className="p-3">
                <TextInput
                  value={state.specialNotes ?? ""}
                  onChangeText={updateSpecialNotes}
                  placeholder="특이사항을 입력하세요"
                  placeholderTextColor="#949BA0"
                  className="border border-caregiver-button-secondary rounded-lg bg-caregiver-bg-primary px-[10px] py-2 text-[13px] text-caregiver-text-primary"
                  style={{ minHeight: 70 }}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </CaregiverSectionCard>

            {/* 제출 버튼 */}
            <View className="px-[14px] pt-[18px] pb-2">
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                className={`bg-caregiver-button-primary rounded-xl py-[14px] items-center ${submitting ? "opacity-50" : ""}`}
              >
                <Text className="text-white text-base font-extrabold">
                  {submitting
                    ? "제출 중…"
                    : isSubmitted
                      ? "다시 제출하기"
                      : "제출하기"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}