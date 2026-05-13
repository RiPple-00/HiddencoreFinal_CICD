import React from "react";
import { View } from "react-native";
import Text from "../../Text";

const DEFAULT_NOTICES = [
  { title: "춘계 보호자 간담회 안내", date: "2024.03.28" },
  { title: "면회 예약 시스템 점검 안내", date: "2024.03.25" },
];

/**
 * 공지사항 리스트.
 */
export default function CaregiverNotice({ notices = DEFAULT_NOTICES }) {
  return (
    <View className="mx-4 mt-4">
      <Text className="font-bold text-caregiver-text-primary mb-2">
        공지사항
      </Text>
      {notices.map(({ title, date }) => (
        <View
          key={title}
          className="flex-row justify-between items-center bg-background-neutral rounded-xl px-4 py-3 mb-2 border border-caregiver-bg-secondary"
        >
          <Text className="text-sm font-bold text-caregiver-text-primary">
            {title}
          </Text>
          <Text className="text-xs text-caregiver-text-secondary">{date}</Text>
        </View>
      ))}
    </View>
  );
}
