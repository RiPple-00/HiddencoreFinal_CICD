import React from "react";
import { TextInput, View } from "react-native";
import Text from "../Text";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

export default function CaregiverCheckRow({ label, value, onChange, reason, onChangeReason }) {
  const isAbnormal = value === "abnormal";

  return (
    <View className="border-b border-caregiver-bg-secondary px-[10px] py-[10px]">
      <View className="flex-row items-center justify-between gap-[10px]">
        <Text className={`flex-1 text-xl font-bold ${isAbnormal ? "text-error-primary" : "text-caregiver-text-primary"}`}>
          {label}
        </Text>
        <CaregiverStatusToggle value={value} onChange={onChange} />
      </View>

      {isAbnormal && (
        <TextInput
          value={reason}
          onChangeText={onChangeReason}
          placeholder="상세 사유를 입력하세요 (발생 시각 및 징후 등)"
          placeholderTextColor="#949BA0"
          className="mt-[10px] border border-error-primary bg-caregiver-bg-primary rounded-lg px-[10px] py-2 text-[13px] text-caregiver-text-primary"
          style={{ minHeight: 60 }}
          multiline
          textAlignVertical="top"
        />
      )}
    </View>
  );
}