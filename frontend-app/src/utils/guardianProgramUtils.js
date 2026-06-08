import { Alert, Platform } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";

export function userFacingAlert(title, message) {
  const body = message || "";
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    typeof window.alert === "function"
  ) {
    window.alert(body ? `${title}\n\n${body}` : title);
    return;
  }
  Alert.alert(title, body || undefined);
}

export function formatDate(dateText, t) {
  const unknown = t ? t("program.date_unknown") : "날짜 미정";
  if (!dateText) return unknown;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return unknown;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

export function formatDateTime(dateText, t) {
  const unknown = t ? t("program.date_unknown") : "날짜 미정";
  if (!dateText) return unknown;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return unknown;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

export function formatPeriod(startText, endText, t) {
  const startDate = startText ? new Date(startText) : null;
  const endDate = endText ? new Date(endText) : null;
  const startValid = startDate && !Number.isNaN(startDate.getTime());
  const endValid = endDate && !Number.isNaN(endDate.getTime());
  if (!startValid && !endValid) return t ? t("program.schedule_unknown") : "일정 미등록";
  const start = formatDateTime(startText, t);
  if (!endValid) return start;
  return `${start} ~ ${formatDateTime(endText, t)}`;
}

export function getStatusBadgeStyle(status) {
  if (status === "모집 중") return [styles.statusBadge, styles.statusBadgeActive];
  if (status === "모집 예정") return [styles.statusBadge, styles.statusBadgeUpcoming];
  if (status === "마감") return [styles.statusBadge, styles.statusBadgeClosed];
  return [styles.statusBadge, styles.statusBadgeDefault];
}

export function getStatusBadgeTextStyle(status) {
  if (status === "모집 중") return [styles.statusBadgeText, styles.statusBadgeTextActive];
  if (status === "모집 예정") return [styles.statusBadgeText, styles.statusBadgeTextUpcoming];
  if (status === "마감") return [styles.statusBadgeText, styles.statusBadgeTextClosed];
  return [styles.statusBadgeText, styles.statusBadgeTextDefault];
}

// Returns a locale key — callers should wrap with t()
export function getApplyButtonText({ alreadyApplied, isFull, recruitStatus, applying, canApply }) {
  if (applying) return "program.applying";
  if (alreadyApplied) return "program.applied";
  if (isFull) return "program.full";
  if (!canApply) {
    if (recruitStatus === "마감") return "program.closed";
    return "program.unavailable";
  }
  return "program.apply";
}

export const PROGRAM_FILTERS = ["전체", "모집 중", "모집 예정", "마감"];

export const PROGRAM_FILTER_LABEL_KEYS = {
  "전체": "program.filter_all",
  "모집 중": "program.filter_recruiting",
  "모집 예정": "program.filter_upcoming",
  "마감": "program.filter_closed",
};

export const PROGRAM_STATUS_LABEL_KEYS = {
  "모집 중": "program.filter_recruiting",
  "모집 예정": "program.filter_upcoming",
  "마감": "program.filter_closed",
};
