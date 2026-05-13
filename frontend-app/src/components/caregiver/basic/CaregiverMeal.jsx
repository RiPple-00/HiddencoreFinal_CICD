import React from "react";
import { View } from "react-native";
import Text from "../../Text";

const DEFAULT_LINES = [
  "메인 메뉴: 전복죽",
  "계란찜, 시금치 나물, 백김치",
  "후식용 계절 과일",
];

/**
 * 오늘의 식단 블록.
 */
export default function CaregiverMeal({ lines = DEFAULT_LINES }) {
  return (
    <View className="mx-4 mt-4">
      <View className="bg-background-neutral rounded-2xl p-4">
        <Text className="font-bold text-caregiver-text-primary mb-2">
          오늘의 식단
        </Text>
        {lines.map((item) => (
          <Text key={item} className="text-sm text-caregiver-text-neutral">
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}
