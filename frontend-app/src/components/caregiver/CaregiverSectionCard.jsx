import React from "react";
import { View } from "react-native";
import Text from "../Text";

/**
 * 섹션 한 단위 (이모지 아이콘 + 한글/영문 타이틀 + 카드 박스).
 * - theme: "caregiver" (기본, 초록) | "guardian" (노랑)
 */
export default function CaregiverSectionCard({ icon, title, subtitle, children, theme = "caregiver" }) {
  const titleText = theme === "guardian" ? "text-guardian-text-primary" : "text-caregiver-text-primary";
  const subtitleText = theme === "guardian" ? "text-guardian-text-secondary" : "text-caregiver-text-secondary";
  const cardBorder = theme === "guardian" ? "border-guardian-button-secondary" : "border-caregiver-button-secondary";

  return (
    <View className="mt-[14px] px-[14px]">
      <View className="flex-row items-end mb-2 gap-[6px]">
        {icon && <Text className="text-[18px]">{icon}</Text>}
        <Text className={`text-[17px] font-extrabold ${titleText}`}>{title}</Text>
        {subtitle && (
          <Text className={`ml-1 text-xs pb-[2px] ${subtitleText}`}>{subtitle}</Text>
        )}
      </View>
      <View className={`rounded-xl border ${cardBorder} bg-background-neutral overflow-hidden`}>
        {children}
      </View>
    </View>
  );
}
