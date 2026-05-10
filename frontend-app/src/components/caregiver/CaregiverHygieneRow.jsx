import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

/**
 * 위생점검 항목 한 줄 - 좌측 라벨 + 우측 정상/이상 토글.
 * 이상 선택 시 아래에 작은 메모 입력란이 펼쳐진다("각각의 메모에 간단히 기입").
 *
 * value = { status: null|"normal"|"abnormal", memo: string }
 */
export default function CaregiverHygieneRow({
  label,
  value,
  onChange,
  isLast = false,
}) {
  const safeValue = value || {};
  const isAbnormal = safeValue.status === "abnormal";

  const updateStatus = (next) => onChange({ ...safeValue, status: next });
  const updateMemo = (text) => onChange({ ...safeValue, memo: text });

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.headerLine}>
        <Text style={[styles.label, isAbnormal && styles.labelAbnormal]}>
          {label}
        </Text>
        <CaregiverStatusToggle value={safeValue.status} onChange={updateStatus} />
      </View>

      {isAbnormal ? (
        <TextInput
          value={safeValue.memo ?? ""}
          onChangeText={updateMemo}
          placeholder="이상 사유를 간단히 입력하세요"
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
  headerLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#2B3F5C",
    paddingRight: 8,
  },
  labelAbnormal: {
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
