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

export function formatDate(dateText) {
  if (!dateText) return "날짜 미정";

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "날짜 미정";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}/${day}`;
}

export function formatDateTime(dateText) {
  if (!dateText) return "날짜 미정";

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "날짜 미정";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${month}/${day} ${hour}:${minute}`;
}

export function formatPeriod(startText, endText) {
  const start = formatDateTime(startText);
  const end = formatDateTime(endText);

  if (start === "날짜 미정" && end === "날짜 미정") {
    return "일정 미등록";
  }

  if (end === "날짜 미정") {
    return start;
  }

  return `${start} ~ ${end}`;
}

export function getStatusBadgeStyle(status) {
  if (status === "모집 중") {
    return [styles.statusBadge, styles.statusBadgeActive];
  }

  if (status === "모집 예정") {
    return [styles.statusBadge, styles.statusBadgeUpcoming];
  }

  if (status === "마감") {
    return [styles.statusBadge, styles.statusBadgeClosed];
  }

  return [styles.statusBadge, styles.statusBadgeDefault];
}

export function getStatusBadgeTextStyle(status) {
  if (status === "모집 중") {
    return [styles.statusBadgeText, styles.statusBadgeTextActive];
  }

  if (status === "모집 예정") {
    return [styles.statusBadgeText, styles.statusBadgeTextUpcoming];
  }

  if (status === "마감") {
    return [styles.statusBadgeText, styles.statusBadgeTextClosed];
  }

  return [styles.statusBadgeText, styles.statusBadgeTextDefault];
}

export function getApplyButtonText({
  alreadyApplied,
  isFull,
  recruitStatus,
  applying,
  canApply,
}) {
  if (applying) return "신청 중...";
  if (alreadyApplied) return "신청완료";
  if (isFull) return "정원마감";
  if (!canApply) {
    if (recruitStatus === "마감") return "마감";
    return "신청불가";
  }
  return "신청하기";
}

export const PROGRAM_FILTERS = ["전체", "모집 중", "모집 예정", "마감"];
