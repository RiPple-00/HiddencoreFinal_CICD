import React from "react";
import { View } from "react-native";
import Text from "../../Text";

const DEFAULT_WEEKS = [
  ["12", "13", "14", "15", "16", "17", "18"],
  ["19", "20", "21", "22", "23", "24", "25"],
];

const DEFAULT_BULLETS = [
  "● 03/11 09:00 오전 근무",
  "● 03/14 15:00 휴무",
];

/**
 * 요양사 메인용 2주 일정 요약(더미 그리드).
 */
export default function CaregiverCalendar({
  weeks = DEFAULT_WEEKS,
  highlightedDay = "14",
  bullets = DEFAULT_BULLETS,
}) {
  return (
    <View className="mx-4 mt-4">
      <View className="bg-background-neutral rounded-2xl p-4">
        <Text className="font-bold text-caregiver-text-primary mb-3">
          2주 일정 요약
        </Text>
        {weeks.map((week, wi) => (
          <View key={wi} className="flex-row justify-between mb-2">
            {week.map((d) => (
              <View
                key={d}
                className={`w-9 h-9 rounded-lg justify-center items-center ${
                  d === highlightedDay
                    ? "bg-caregiver-button-primary"
                    : "bg-caregiver-bg-secondary"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    d === highlightedDay
                      ? "text-white"
                      : "text-caregiver-text-primary"
                  }`}
                >
                  {d}
                </Text>
              </View>
            ))}
          </View>
        ))}
        {bullets.map((line) => (
          <Text
            key={line}
            className="text-xs text-caregiver-text-neutral mt-1"
          >
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}
