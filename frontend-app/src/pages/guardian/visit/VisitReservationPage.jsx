import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import VisitCalendarSection from "../../../components/visit/VisitCalendarSection";
import VisitTimeSelector from "../../../components/visit/VisitTimeSelector";
import visitApi from "../../../api/visitApi";
import { resolveApiBaseUrl } from "../../../api/index";

const PRIMARY = "#0B4EA2";
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
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
    tint: "#EDE9FE",
    icon: "👥",
  },
  {
    title: "외출 및 외박 면회",
    sub: "외출·외박 면회 신청",
    summary: "외출 및 외박 면회",
    detailLine: "외출·외박 (사전 신청)",
    apiValue: "외출 및 외박 면회",
    tint: "#E0F2FE",
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
  const yoil = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const line = `${y}년 ${m}월 ${d}일 (${yoil}) ${timeStr}`;
  const detail = `${y}년 ${m}월 ${d}일 (${yoil}) • ${timeStr}`;
  return { line, detail };
}

function ProgressBar({ step, total }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressSegments}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.progressSeg,
              i < step ? styles.progressSegOn : styles.progressSegOff,
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressLabel}>
        STEP {step}/{total}
      </Text>
    </View>
  );
}

export default function VisitReservationPage({ onBack, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTime, setSelectedTime] = useState("11:00");
  const [applicantName, setApplicantName] = useState("");
  const [contact, setContact] = useState("");
  const [relationship, setRelationship] = useState("");
  const [relModalOpen, setRelModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visitTypeIdx, setVisitTypeIdx] = useState(0);

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
    if (!applicantName.trim() || !contact.trim() || !relationship || submitting) {
      return;
    }
    const phone = normalizeKoreanMobile(contact);
    const selectedVisit = VISIT_TYPES[visitTypeIdx % VISIT_TYPES.length];
    const body = {
      patientId: DEFAULT_PATIENT_ID,
      visitDate: formatLocalDate(selectedDate),
      visitTime:
        selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime,
      visitorName: applicantName.trim(),
      visitorPhone: phone,
      relationship,
      visitType: selectedVisit.apiValue,
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
        visitDateLine: line,
        visitDateDetail: detail,
        visitTypeSummary: selectedVisit.summary,
        visitTypeDetail: selectedVisit.detailLine,
        patientLine: buildPatientLineForUi(
          data.patientId,
          data.patientName,
          data.patientRoom
        ),
        applicantName: data.visitorName,
        contact: data.visitorPhone,
        relationship: data.relationship,
        visitRequestId: data.visitRequestId,
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
          msg = arr
            .map((e) => e.defaultMessage || e.message || e.field || "")
            .filter(Boolean)
            .join("\n");
        }
        const first = d.errors?.[0];
        if (!msg && first?.defaultMessage) msg = first.defaultMessage;
        if (!msg && typeof d.message === "string") msg = d.message;
        if (!msg && typeof d.detail === "string") msg = d.detail;
      }
      if (!msg) msg = err?.message;
      if (isNetwork) {
        msg =
          "서버에 연결하지 못했습니다.\n\n" +
          "· PC에서 Spring Boot(포트 " +
          (process.env.EXPO_PUBLIC_API_PORT || "8080") +
          ")가 실행 중인지 확인\n" +
          "· 휴대폰과 PC가 같은 Wi‑Fi인지 확인\n" +
          "· 필요하면 프로젝트 루트 .env에 아래처럼 PC IP를 지정 후 Metro 재시작\n" +
          "  EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8080\n\n" +
          "현재 요청 주소: " +
          base;
      }
      if (!msg) msg = "예약 저장에 실패했습니다.";
      Alert.alert("예약 실패", String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = Boolean(selectedTime);
  const canSubmit =
    applicantName.trim().length > 0 &&
    contact.trim().length > 0 &&
    relationship.length > 0 &&
    !submitting;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={headerBack} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>방문 예약 신청</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ProgressBar step={step} total={3} />

      {step === 1 ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollPad}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.blockTitle}>면회 유형 선택</Text>
          <Text style={styles.typeHint}>카드를 누르면 유형이 순서대로 바뀝니다</Text>
          <TouchableOpacity
            style={[styles.typeCard, { backgroundColor: visitType.tint }]}
            onPress={() =>
              setVisitTypeIdx((i) => (i + 1) % VISIT_TYPES.length)
            }
            activeOpacity={0.88}
          >
            <View style={styles.typeIconCircle}>
              <Text style={styles.typeIcon}>{visitType.icon}</Text>
            </View>
            <Text style={styles.typeMain}>{visitType.title}</Text>
            <Text style={styles.typeSub}>{visitType.sub}</Text>
          </TouchableOpacity>

          <Text style={[styles.blockTitle, styles.dateTitle]}>날짜 선택</Text>
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
            style={[styles.primaryBtn, !canNext && styles.primaryBtnDisabled]}
            onPress={goNext}
            disabled={!canNext}
          >
            <Text style={styles.primaryBtnText}>다음 단계 →</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollPad}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.step2Title}>신청 정보 입력</Text>
            <Text style={styles.step2Sub}>
              예약 확정을 위해 정확한 정보를 입력해주세요.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryLabel}>선택한 예약 정보</Text>
                <Text style={styles.summaryShield}>🛡</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryIconBox}>
                  <Text style={styles.summaryEmoji}>📅</Text>
                </View>
                <View style={styles.summaryTextCol}>
                  <Text style={styles.summaryRowLabel}>예약 일시</Text>
                  <Text style={styles.summaryRowValue}>{dateTimeLine}</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryIconBox}>
                  <Text style={styles.summaryEmoji}>👥</Text>
                </View>
                <View style={styles.summaryTextCol}>
                  <Text style={styles.summaryRowLabel}>면회 유형</Text>
                  <Text style={styles.summaryRowValue}>{visitType.summary}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.fieldLabel}>신청자 성함</Text>
            <TextInput
              style={styles.input}
              value={applicantName}
              onChangeText={setApplicantName}
              placeholder="성함을 입력하세요"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>연락처</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              placeholder="010-0000-0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>환자와의 관계</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setRelModalOpen(true)}
            >
              <Text
                style={[
                  styles.selectText,
                  !relationship && styles.selectPlaceholder,
                ]}
              >
                {relationship || "관계를 선택해주세요"}
              </Text>
              <Text style={styles.chev}>⌄</Text>
            </TouchableOpacity>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>ⓘ 방문 시 유의사항</Text>
              <Text style={styles.noticeBullet}>
                • 면회 시작 10분 전까지 도착하여 원무과에서 본인 확인을 완료해주시기
                바랍니다.
              </Text>
              <Text style={styles.noticeBullet}>
                • 호흡기 증상(기침, 발열)이 있는 경우 병원 입장이 제한될 수 있습니다.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                !canSubmit && styles.primaryBtnDisabled,
              ]}
              onPress={submitReservation}
              disabled={!canSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>예약 신청하기 →</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={relModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRelModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setRelModalOpen(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>관계 선택</Text>
            {RELATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.modalItem}
                onPress={() => {
                  setRelationship(opt);
                  setRelModalOpen(false);
                }}
              >
                <Text style={styles.modalItemText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F6F8" },
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  back: { fontSize: 22, color: PRIMARY, width: 40 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: PRIMARY },
  headerSpacer: { width: 40 },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    gap: 12,
  },
  progressSegments: { flex: 1, flexDirection: "row", gap: 6 },
  progressSeg: { flex: 1, height: 6, borderRadius: 3 },
  progressSegOn: { backgroundColor: PRIMARY },
  progressSegOff: { backgroundColor: "#E5E7EB" },
  progressLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  scroll: { flex: 1 },
  scrollPad: { padding: 16, paddingBottom: 36 },
  blockTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  typeHint: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  dateTitle: { marginTop: 20, marginBottom: 8 },
  typeCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(11, 78, 162, 0.12)",
  },
  typeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  typeIcon: { fontSize: 26 },
  typeMain: { fontSize: 18, fontWeight: "800", color: PRIMARY, marginBottom: 4 },
  typeSub: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  step2Title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  step2Sub: { fontSize: 14, color: "#6B7280", marginBottom: 18, lineHeight: 20 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  summaryLabel: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
  summaryShield: { fontSize: 18, opacity: 0.35 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  summaryEmoji: { fontSize: 18 },
  summaryTextCol: { flex: 1 },
  summaryRowLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 4 },
  summaryRowValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  selectText: { fontSize: 16, color: "#111827", flex: 1 },
  selectPlaceholder: { color: "#9CA3AF" },
  chev: { fontSize: 18, color: "#6B7280" },
  noticeBox: {
    marginTop: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  noticeTitle: { fontSize: 14, fontWeight: "700", color: "#92400E", marginBottom: 8 },
  noticeBullet: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 20,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 12,
    paddingBottom: 28,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingBottom: 12,
    color: "#111827",
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  modalItemText: { fontSize: 16, color: "#111827" },
});
