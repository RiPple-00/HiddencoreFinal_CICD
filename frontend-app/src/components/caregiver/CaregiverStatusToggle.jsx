import React from "react";
import { Pressable, View } from "react-native";
import Text from "../Text";

/**
 * 정상 / 이상 두 개 버튼 한 쌍을 노출하는 컴포넌트.
 * - value: null | "normal" | "abnormal"
 * - onChange: (newValue) => void
 * - size: "md" (기본) | "sm"
 */
export default function CaregiverStatusToggle({ value, onChange, size = "md" }) {
  const isNormal   = value === "normal";
  const isAbnormal = value === "abnormal";

  const isSm = size === "sm";
  const wrapClass  = isSm ? "flex-row gap-1" : "flex-row gap-[6px]";
  const btnBase    = isSm
    ? "min-w-[44px] rounded-[7px] py-1 px-2 items-center justify-center"
    : "min-w-[56px] rounded-lg py-[6px] px-[14px] items-center justify-center";
  const textClass  = isSm ? "text-xs font-bold" : "text-[13px] font-bold";

  return (
    <View className={wrapClass} style={{ borderWidth: 0 }}>
      {/* 정상 버튼 */}
      <Pressable
        onPress={() => onChange(isNormal ? null : "normal")}
        className={`${btnBase} border ${
          isNormal
            ? "bg-caregiver-button-primary border-caregiver-button-primary"
            : "bg-background-neutral border-caregiver-button-primary"
        }`}
        style={{ borderWidth: 1.2 }}
        hitSlop={6}
      >
        <Text className={`${textClass} ${isNormal ? "text-white" : "text-caregiver-text-primary"}`}>
          정상
        </Text>
      </Pressable>

      {/* 이상 버튼 */}
      <Pressable
        onPress={() => onChange(isAbnormal ? null : "abnormal")}
        className={`${btnBase} border ${
          isAbnormal
            ? "bg-error-primary border-error-primary"
            : "bg-background-neutral border-caregiver-button-secondary"
        }`}
        style={{ borderWidth: 1.2 }}
        hitSlop={6}
      >
        <Text className={`${textClass} ${isAbnormal ? "text-white" : "text-caregiver-text-secondary"}`}>
          이상
        </Text>
      </Pressable>
    </View>
  );
}