import React from "react";
import { TextInput, View } from "react-native";
import Text from "../Text";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

/**
 * 위생점검 항목 한 줄 - 좌측 라벨 + 우측 정상/이상 토글.
 * - theme: "caregiver" (기본, 초록) | "guardian" (노랑)
 */
export default function CaregiverHygieneRow({ label, value, onChange, isLast = false, readOnly = false, showStatusError = false, theme = "caregiver" }) {
  const safeValue  = value || {};
  const isAbnormal = safeValue.status === "abnormal";

  const textPrimary   = theme === "guardian" ? "text-guardian-text-primary"   : "text-caregiver-text-primary";
  const bgPrimary     = theme === "guardian" ? "bg-guardian-bg-primary"       : "bg-caregiver-bg-primary";
  const borderDivider = theme === "guardian" ? "border-guardian-bg-secondary" : "border-caregiver-bg-secondary";

  const updateStatus = (next) => {
    if (readOnly) return;
    onChange({ ...safeValue, status: next });
  };
  const updateMemo = (text) => {
    if (readOnly) return;
    onChange({ ...safeValue, memo: text });
  };

  return (
    <View className={`px-[14px] py-3 ${!isLast ? `border-b ${borderDivider}` : ""}`}>
      <View className="flex-row items-center justify-between">
        <Text className={`flex-1 text-sm font-bold pr-2 ${isAbnormal ? "text-error-primary" : textPrimary}`}>
          {label}
        </Text>
        <View className={showStatusError ? "rounded-xl border-2 border-error-primary p-[2px]" : ""}>
          <CaregiverStatusToggle readOnly={readOnly} theme={theme} value={safeValue.status} onChange={updateStatus} />
        </View>
      </View>

      {isAbnormal && (
        readOnly ? (
          <Text className={`mt-2 border border-error-primary ${bgPrimary} rounded-lg px-[10px] py-2 text-[13px] ${textPrimary} min-h-[44px]`}>
            {safeValue.memo?.trim() ? safeValue.memo : "—"}
          </Text>
        ) : (
          <TextInput
            value={safeValue.memo ?? ""}
            onChangeText={updateMemo}
            placeholder="이상 사유를 간단히 입력하세요"
            placeholderTextColor="#949BA0"
            className={`mt-2 border border-error-primary ${bgPrimary} rounded-lg px-[10px] py-2 text-[13px] ${textPrimary}`}
            style={{ minHeight: 44 }}
            multiline
            textAlignVertical="top"
          />
        )
      )}
    </View>
  );
}
