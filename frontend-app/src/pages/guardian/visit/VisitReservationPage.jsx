import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/Text";
import VisitCalendarSection from "../../../components/visit/VisitCalendarSection";
import VisitTimeSelector from "../../../components/visit/VisitTimeSelector";
import visitApi from "@/api/visitApi";
import { resolveApiBaseUrl } from "@/api/index";
import { G, GMutedLight } from "@/styles/guardianTheme";

const TIME_SLOTS = [
  "09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00",
];

const RELATION_OPTIONS = ["배우자", "자녀", "부모", "형제·자매", "기타"];

const DEFAULT_PATIENT_ID = Number(process.env.EXPO_PUBLIC_PATIENT_ID) || 260401001;

/** API 응답 이름이 인코딩 문제로 깨질 때(Expo QR 등) UI에 쓸 더미 표기 — DB 시드와 동일 */
const KNOWN_PATIENT_DISPLAY = {
  260401001: { name: "김영희" },
};

function buildPatientLineForUi(patientId, apiName, apiRoom) {
  const id = Number(patientId);
  const known = KNOWN_PATIENT_DISPLAY[id]?.name;
  const name =
    known ||
    (typeof apiName === "string" && apiName.trim().length > 0
      ? apiName.trim()
      : "환자");
  const room =
    typeof apiRoom === "string" && apiRoom.trim().length > 0
      ? apiRoom.trim()
      : "병실 미배정";
  return `${name} (${room})`;
}

/** 카드 탭 시 순환: 방문 → 외출/외박 → 특별 → … (백엔드 visitType 30자 이하) */
const VISIT_TYPES = [
  {
    title: "방문 면회",
    sub: "병원 내 직접 면회",
    summary: "방문 면회",
    detailLine: "일반 대면 면회 (병동 면회실)",
    apiValue: "방문 면회",
    tint: "#FEF7E5",
    icon: "👥",
  },
  {
    title: "외출 및 외박 면회",
    sub: "외출·외박 면회 신청",
    summary: "외출 및 외박 면회",
    detailLine: "외출·외박 (사전 신청)",
    apiValue: "외출 및 외박 면회",
    tint: "#FEFAF2",
    icon: "🚶",
  },
  {
    title: "특별 면회",
    sub: "별도 승인 특별 면회",
    summary: "특별 면회",
    detailLine: "특별 면회 (사전 승인)",
    apiValue: "특별 면회",
    tint: "#FEF3C7",
    icon: "⭐",
  },
];

/** 있으면 DOCUMENT.requester_user_id 로 전달. 없으면 서버가 GUARDIAN_PATIENT에서 주보호자 연결 */
const REQUESTER_USER_ID = process.env.EXPO_PUBLIC_REQUESTER_USER_ID;
/** seed-expo-visit-minimal.sql 의 보호자 USERS.user_id — 로컬에서 시드 없을 때 400(보호자 없음) 완화 */
const DEV_DEFAULT_REQUESTER_USER_ID = 6;

function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 백엔드 @Pattern(01x…) 통과용 */
function normalizeKoreanMobile(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("01")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10 && digits.startsWith("01")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw.trim();
}

function parseDateFromApi(iso) {
  if (!iso) return new Date();
  if (typeof iso === "string" && iso.length >= 10) {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
}

function shortTime(t) {
  if (t == null || t === "") return "";
  const s = typeof t === "string" ? t : String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function formatVisitDateTime(date, timeStr) {
  const yoil = ["일","월","화","수","목","금","토"][date.getDay()];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const line   = `${y}년 ${m}월 ${d}일 (${yoil}) ${timeStr}`;
  const detail = `${y}년 ${m}월 ${d}일 (${yoil}) • ${timeStr}`;
  return { line, detail };
}

function ProgressBar({ step, total }) {
  return (
    <View className="flex-row items-center px-4 py-3 bg-background-neutral gap-3">
      <View className="flex-1 flex-row gap-[6px]">
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            className={`flex-1 h-[6px] rounded-[3px] ${
              i < step ? "bg-guardian-button-primary" : "bg-guardian-bg-secondary"
            }`}
          />
        ))}
      </View>
      <Text className="text-xs text-guardian-text-neutral font-bold">
        STEP {step}/{total}
      </Text>
    </View>
  );
}

export default function VisitReservationPage({ onBack, onComplete }) {
  const [step,          setStep]          = useState(1);
  const [selectedDate,  setSelectedDate]  = useState(() => new Date());
  const [selectedTime,  setSelectedTime]  = useState("11:00");
  const [applicantName, setApplicantName] = useState("");
  const [contact,       setContact]       = useState("");
  const [relationship,  setRelationship]  = useState("");
  const [relModalOpen,  setRelModalOpen]  = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [visitTypeIdx,  setVisitTypeIdx]  = useState(0);

  const visitType = useMemo(
    () => VISIT_TYPES[visitTypeIdx % VISIT_TYPES.length],
    [visitTypeIdx]
  );

  const { line: dateTimeLine, detail: dateTimeDetail } = useMemo(
    () => formatVisitDateTime(selectedDate, selectedTime),
    [selectedDate, selectedTime]
  );

  const headerBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
    } else {
      onBack?.();
    }
  }, [step, onBack]);

  const goNext = () => {
    if (!selectedTime) return;
    setStep(2);
  };

  const submitReservation = async () => {
    if (!applicantName.trim() || !contact.trim() || !relationship || submitting) return;
    const phone = normalizeKoreanMobile(contact);
    const selectedVisit = VISIT_TYPES[visitTypeIdx % VISIT_TYPES.length];
    const body = {
      patientId:    DEFAULT_PATIENT_ID,
      visitDate:    formatLocalDate(selectedDate),
      visitTime:    selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime,
      visitorName:  applicantName.trim(),
      visitorPhone: phone,
      relationship,
      visitType:    selectedVisit.apiValue,
    };
    if (REQUESTER_USER_ID != null && String(REQUESTER_USER_ID).trim() !== "") {
      body.requesterUserId = Number(REQUESTER_USER_ID);
    } else if (typeof __DEV__ !== "undefined" && __DEV__) {
      body.requesterUserId = DEV_DEFAULT_REQUESTER_USER_ID;
    }
    setSubmitting(true);
    try {
      const { data } = await visitApi.createVisit(body);
      const savedDate = parseDateFromApi(data.visitDate);
      const timeStr = shortTime(data.visitTime);
      const { line, detail } = formatVisitDateTime(savedDate, timeStr);
      onComplete?.({
        visitDateLine:    line,
        visitDateDetail:  detail,
        visitTypeSummary: selectedVisit.summary,
        visitTypeDetail:  selectedVisit.detailLine,
        patientLine:      buildPatientLineForUi(data.patientId, data.patientName, data.patientRoom),
        applicantName:    data.visitorName,
        contact:          data.visitorPhone,
        relationship:     data.relationship,
        visitRequestId:   data.visitRequestId,
      });
    } catch (err) {
      const base = err?.config?.baseURL || resolveApiBaseUrl();
      const isNetwork =
        err?.message === "Network Error" ||
        err?.code === "ERR_NETWORK" ||
        err?.code === "ECONNABORTED";
      let msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      if (!msg && err?.response?.data && typeof err?.response?.data === "object") {
        const d = err.response.data;
        const arr = d.errors || d.fieldErrors || d.violations;
        if (Array.isArray(arr) && arr.length) {
          msg = arr.map((e) => e.defaultMessage || e.message || e.field || "").filter(Boolean).join("\n");
        }
        const first = d.errors?.[0];
        if (!msg && first?.defaultMessage) msg = first.defaultMessage;
        if (!msg && typeof d.message === "string") msg = d.message;
        if (!msg && typeof d.detail   === "string") msg = d.detail;
      }
      if (!msg) msg = err?.message;
      if (isNetwork) {
        msg =
          "서버에 연결하지 못했습니다.\n\n" +
          "· PC에서 Spring Boot(포트 " + (process.env.EXPO_PUBLIC_API_PORT || "8080") + ")가 실행 중인지 확인\n" +
          "· 휴대폰과 PC가 같은 Wi‑Fi인지 확인\n" +
          "· 필요하면 프로젝트 루트 .env에 아래처럼 PC IP를 지정 후 Metro 재시작\n" +
          "  EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8080\n\n" +
          "현재 요청 주소: " + base;
      }
      if (!msg) msg = "예약 저장에 실패했습니다.";
      Alert.alert("예약 실패", String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const canNext   = Boolean(selectedTime);
  const canSubmit =
    applicantName.trim().length > 0 &&
    contact.trim().length > 0 &&
    relationship.length > 0 &&
    !submitting;

  return (
    <SafeAreaView
      className="flex-1 bg-guardian-bg-secondary"
      edges={["bottom", "left", "right"]}
    >

      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-[14px] bg-background-neutral border-b border-guardian-button-secondary">
        <TouchableOpacity onPress={headerBack} hitSlop={12}>
          <Text className="text-[22px] text-guardian-text-primary w-10">←</Text>
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-guardian-text-primary">
          방문 예약 신청
        </Text>
        <View className="w-10" />
      </View>

      <ProgressBar step={step} total={3} />

      {step === 1 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 면회 유형 선택 */}
          <Text className="text-[17px] font-extrabold text-guardian-text-primary mb-2">
            면회 유형 선택
          </Text>
          <Text className="text-[13px] text-guardian-text-neutral mb-3">
            카드를 누르면 유형이 순서대로 바뀝니다
          </Text>

          {/* tint는 VISIT_TYPES 데이터 기반 동적 색상이라 inline style 유지 */}
          <TouchableOpacity
            style={{ backgroundColor: visitType.tint }}
            className="rounded-2xl p-5 items-center border border-guardian-button-secondary"
            onPress={() => setVisitTypeIdx((i) => (i + 1) % VISIT_TYPES.length)}
            activeOpacity={0.88}
          >
            <View className="w-14 h-14 rounded-full bg-background-neutral items-center justify-center mb-3">
              <Text className="text-[26px]">{visitType.icon}</Text>
            </View>
            <Text className="text-[18px] font-extrabold text-guardian-text-primary mb-1">
              {visitType.title}
            </Text>
            <Text className="text-[14px] font-bold text-guardian-text-secondary">
              {visitType.sub}
            </Text>
          </TouchableOpacity>

          {/* 날짜 선택 */}
          <Text className="text-[17px] font-extrabold text-guardian-text-primary mt-5 mb-2">
            날짜 선택
          </Text>
          <VisitCalendarSection
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          <VisitTimeSelector
            availableTimes={TIME_SLOTS}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
          />

          <TouchableOpacity
            className={`mt-6 bg-guardian-button-primary py-4 rounded-xl items-center ${!canNext ? "opacity-50" : ""}`}
            onPress={goNext}
            disabled={!canNext}
          >
            <Text className="text-guardian-text-primary text-base font-extrabold">
              다음 단계 →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 신청 정보 입력 */}
            <Text className="text-xl font-extrabold text-guardian-text-primary mb-2">
              신청 정보 입력
            </Text>
            <Text className="text-[14px] text-guardian-text-neutral mb-[18px] leading-5">
              예약 확정을 위해 정확한 정보를 입력해주세요.
            </Text>

            {/* 선택한 예약 요약 카드 */}
            <View className="bg-background-neutral rounded-2xl p-4 mb-5">
              <View className="flex-row justify-between mb-[14px]">
                <Text className="text-xs text-guardian-text-neutral opacity-60 font-bold">
                  선택한 예약 정보
                </Text>
                <Text className="text-[18px] opacity-35">🛡</Text>
              </View>

              <View className="flex-row items-start mb-[14px]">
                {/* summaryIconBox: guardian-button-secondary (크림 톤으로 통일) */}
                <View className="w-10 h-10 rounded-[10px] bg-guardian-button-secondary items-center justify-center mr-3">
                  <Text className="text-[18px]">📅</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-guardian-text-neutral opacity-60 mb-1">예약 일시</Text>
                  <Text className="text-[15px] font-bold text-guardian-text-primary">{dateTimeLine}</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-[10px] bg-guardian-button-secondary items-center justify-center mr-3">
                  <Text className="text-[18px]">👥</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-guardian-text-neutral opacity-60 mb-1">면회 유형</Text>
                  <Text className="text-[15px] font-bold text-guardian-text-primary">{visitType.summary}</Text>
                </View>
              </View>
            </View>

            {/* 신청자 성함 */}
            <Text className="text-[14px] font-bold text-guardian-text-primary mb-2 mt-1">
              신청자 성함
            </Text>
            <TextInput
              className="bg-guardian-bg-secondary rounded-xl px-[14px] py-[14px] text-base text-guardian-text-primary mb-1"
              value={applicantName}
              onChangeText={setApplicantName}
              placeholder="성함을 입력하세요"
              placeholderTextColor={GMutedLight}
            />

            {/* 연락처 */}
            <Text className="text-[14px] font-bold text-guardian-text-primary mb-2 mt-1">
              연락처
            </Text>
            <TextInput
              className="bg-guardian-bg-secondary rounded-xl px-[14px] py-[14px] text-base text-guardian-text-primary mb-1"
              value={contact}
              onChangeText={setContact}
              placeholder="010-0000-0000"
              placeholderTextColor={GMutedLight}
              keyboardType="phone-pad"
            />

            {/* 환자와의 관계 */}
            <Text className="text-[14px] font-bold text-guardian-text-primary mb-2 mt-1">
              환자와의 관계
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between bg-guardian-bg-secondary rounded-xl px-[14px] py-[14px] mb-2"
              onPress={() => setRelModalOpen(true)}
            >
              <Text className={`text-base flex-1 ${relationship ? "text-guardian-text-primary" : "text-guardian-text-neutral opacity-50"}`}>
                {relationship || "관계를 선택해주세요"}
              </Text>
              <Text className="text-[18px] text-guardian-text-neutral">⌄</Text>
            </TouchableOpacity>

            {/* 방문 시 유의사항 */}
            <View className="mt-4 bg-guardian-button-secondary rounded-xl p-[14px] mb-2">
              <Text className="text-[14px] font-bold text-guardian-text-primary mb-2">
                ⓘ 방문 시 유의사항
              </Text>
              <Text className="text-[13px] text-guardian-text-neutral leading-5 mb-[6px]">
                • 면회 시작 10분 전까지 도착하여 원무과에서 본인 확인을 완료해주시기 바랍니다.
              </Text>
              <Text className="text-[13px] text-guardian-text-neutral leading-5 mb-[6px]">
                • 호흡기 증상(기침, 발열)이 있는 경우 병원 입장이 제한될 수 있습니다.
              </Text>
            </View>

            <TouchableOpacity
              className={`mt-6 bg-guardian-button-primary py-4 rounded-xl items-center ${!canSubmit ? "opacity-50" : ""}`}
              onPress={submitReservation}
              disabled={!canSubmit}
            >
              {submitting ? (
                <ActivityIndicator color={G.textSecondary} />
              ) : (
                <Text className="text-guardian-text-primary text-base font-extrabold">
                  예약 신청하기 →
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* 관계 선택 모달 */}
      <Modal
        visible={relModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRelModalOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setRelModalOpen(false)}
        >
          <Pressable
            className="bg-background-neutral rounded-t-2xl py-3 pb-7"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-base font-extrabold px-5 pb-3 text-guardian-text-primary">
              관계 선택
            </Text>
            {RELATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                className="py-[14px] px-5 border-t border-guardian-bg-secondary"
                onPress={() => {
                  setRelationship(opt);
                  setRelModalOpen(false);
                }}
              >
                <Text className="text-base text-guardian-text-primary">{opt}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}