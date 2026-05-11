import React from "react";
import { View } from "react-native";
import Text from "../Text";

/**
 * 섹션 한 단위 (이모지 아이콘 + 한글/영문 타이틀 + 카드 박스).
 *
 * <icon> 식사 (Meal)
 * ┌────────────────────────────────┐
 * │ children ...                  │
 * └────────────────────────────────┘
 */
export default function CaregiverSectionCard({ icon, title, subtitle, children }) {
  return (
    <View className="mt-[14px] px-[14px]">
      <View className="flex-row items-end mb-2 gap-[6px]">
        {icon && <Text className="text-[18px]">{icon}</Text>}
        <Text className="text-[17px] font-extrabold text-caregiver-text-primary">{title}</Text>
        {subtitle && (
          <Text className="ml-1 text-xs text-caregiver-text-secondary pb-[2px]">{subtitle}</Text>
        )}
      </View>
      <View className="rounded-xl border border-caregiver-button-secondary bg-background-neutral overflow-hidden">
        {children}
      </View>
    </View>
  );
}