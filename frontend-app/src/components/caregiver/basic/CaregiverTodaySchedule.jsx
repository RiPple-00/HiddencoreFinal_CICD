import React from "react";
import { View } from "react-native";
import Text from "../../Text";

const DEFAULT_ITEMS = [
  { name: "김태진 (68세)", desc: "수술입력 및 복약 준비 및 금식" },
  { name: "이성우 (88세)", desc: "체계기록 면회" },
];

/**
 * 오늘 중요 일정 카드 목록.
 */
export default function CaregiverTodaySchedule({ items = DEFAULT_ITEMS }) {
  return (
    <View className="mx-4 mt-4">
      <Text className="font-bold text-caregiver-text-primary mb-2">
        오늘 중요 일정
      </Text>
      {items.map(({ name, desc }) => (
        <View
          key={name}
          className="bg-caregiver-bg-secondary rounded-xl p-3 mb-2"
        >
          <Text className="font-bold text-caregiver-text-primary mb-1">
            {name}
          </Text>
          <Text className="text-sm text-caregiver-text-neutral">{desc}</Text>
        </View>
      ))}
    </View>
  );
}
