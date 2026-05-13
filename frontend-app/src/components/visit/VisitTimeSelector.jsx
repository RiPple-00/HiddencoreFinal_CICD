import React from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "../Text";

const DEFAULT_TIMES = [
  "09:00","10:00","11:00","13:00",
  "14:00","15:00","16:00","17:00","18:00",
];

/**
 * availableTimes: string[] (기본 슬롯)
 * selectedTime, onTimeSelect(time: string)
 */
const VisitTimeSelector = ({
  availableTimes = DEFAULT_TIMES,
  selectedTime,
  onTimeSelect,
}) => {
  return (
    <View className="mt-2">
      <Text className="text-[17px] font-extrabold text-guardian-text-primary mb-3">
        시간 선택
      </Text>

      {availableTimes.length === 0 ? (
        <Text className="text-sm text-guardian-text-neutral">
          선택 가능한 시간이 없습니다.
        </Text>
      ) : (
        <View className="flex-row flex-wrap gap-[10px]">
          {availableTimes.map((time) => {
            const selected = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                // 퍼센트는 NativeWind에서 불안정함: inline style 유지
                style={{ width: "30%", flexGrow: 1, minWidth: "28%", maxWidth: "32%" }}
                className={`py-3 rounded-[10px] border items-center ${
                  selected
                    ? "bg-guardian-button-primary border-guardian-button-primary"
                    : "bg-background-neutral border-guardian-button-secondary"
                }`}
                onPress={() => onTimeSelect?.(time)}
                activeOpacity={0.85}
              >
                <Text
                  className={`text-[15px] font-bold ${
                    selected
                      ? "text-guardian-text-primary"  // 노란 배경 위 갈색
                      : "text-guardian-text-neutral"  // 기본
                  }`}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default VisitTimeSelector;