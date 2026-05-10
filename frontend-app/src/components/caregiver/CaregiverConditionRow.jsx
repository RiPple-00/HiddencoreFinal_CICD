import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

/**
 * 상태 안정화(Condition) 섹션 안의 한 줄.
 * - 이상 표시 시 좌측에 빨간 세로줄 + 라벨이 붉어진다.
 * - 추가로 "최근 확인 필요" 같은 보조 경고 텍스트를 노출할 수 있다.
 * - 이상으로 선택한 항목은 그 줄 바로 아래에 자기 전용 메모 입력란이 펼쳐진다.
 *
 * value = { status: null|"normal"|"abnormal", memo: string }
 */
export default function CaregiverConditionRow({
  label,
  value,
  onChange,
  warnText,
  isLast = false,
}) {
  const safeValue = value || {};
  const isAbnormal = safeValue.status === "abnormal";

  const updateStatus = (next) => {
    // 이상에서 정상/미선택으로 돌아가면 항목 메모도 함께 비운다.
    if (next !== "abnormal") {
      onChange({ ...safeValue, status: next, memo: "" });
    } else {
      onChange({ ...safeValue, status: next });
    }
  };
  const updateMemo = (text) => onChange({ ...safeValue, memo: text });

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      {isAbnormal ? <View style={styles.dangerBar} /> : null}

      <View style={styles.headerLine}>
        <View style={styles.left}>
          <Text style={[styles.label, isAbnormal && styles.labelAbnormal]}>
            {label}
          </Text>
          {warnText ? <Text style={styles.warn}>{warnText}</Text> : null}
        </View>
        <CaregiverStatusToggle value={safeValue.status} onChange={updateStatus} />
      </View>

      {isAbnormal ? (
        <TextInput
          value={safeValue.memo ?? ""}
          onChangeText={updateMemo}
          placeholder={`${label} 이상 사유를 간단히 입력하세요`}
          placeholderTextColor="#B0B9C8"
          style={styles.memoInput}
          multiline
          textAlignVertical="top"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F8",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dangerBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: "#E83042",
  },
  headerLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B3F5C",
  },
  labelAbnormal: {
    color: "#C13E48",
  },
  warn: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: "#C13E48",
  },
  memoInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F0C5CB",
    backgroundColor: "#FFF8F9",
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: "#1B2A3A",
  },
});
