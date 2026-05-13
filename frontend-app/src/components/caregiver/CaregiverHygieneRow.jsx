import React from "react";
import { TextInput, View } from "react-native";
import Text from "../Text";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

/**
 * 위생점검 항목 한 줄 - 좌측 라벨 + 우측 정상/이상 토글.
 * 이상 선택 시 아래에 작은 메모 입력란이 펼쳐진다("각각의 메모에 간단히 기입").
 *
 * value = { status: null|"normal"|"abnormal", memo: string }
 */
export default function CaregiverHygieneRow({ label, value, onChange, isLast = false }) {
  const safeValue  = value || {};
  const isAbnormal = safeValue.status === "abnormal";

  const updateStatus = (next) => onChange({ ...safeValue, status: next });
  const updateMemo   = (text) => onChange({ ...safeValue, memo: text });

  return (
    <View className={`px-[14px] py-3 ${!isLast ? "border-b border-caregiver-bg-secondary" : ""}`}>
      <View className="flex-row items-center justify-between">
        <Text className={`flex-1 text-sm font-bold pr-2 ${isAbnormal ? "text-error-primary" : "text-caregiver-text-primary"}`}>
          {label}
        </Text>
        <CaregiverStatusToggle value={safeValue.status} onChange={updateStatus} />
      </View>

      {isAbnormal && (
        <TextInput
          value={safeValue.memo ?? ""}
          onChangeText={updateMemo}
          placeholder="이상 사유를 간단히 입력하세요"
          placeholderTextColor="#949BA0"
          className="mt-2 border border-error-primary bg-caregiver-bg-primary rounded-lg px-[10px] py-2 text-[13px] text-caregiver-text-primary"
          style={{ minHeight: 44 }}
          multiline
          textAlignVertical="top"
        />
      )}
    </View>
  );
}