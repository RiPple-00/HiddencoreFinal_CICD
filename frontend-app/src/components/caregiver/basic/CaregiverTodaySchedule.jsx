import React from "react";
import { ActivityIndicator, View } from "react-native";
import Text from "../../Text";

function formatScheduleTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * 오늘 중요 일정 카드 목록.
 * - items: API ScheduleResponse[] | null(로딩 중) | [](빈 결과)
 * - loading: boolean
 */
export default function CaregiverTodaySchedule({ items = null, loading = false }) {
  return (
    <View className="mx-4 mt-4">
      <Text className="font-bold text-caregiver-text-primary mb-2">
        오늘 중요 일정
      </Text>

      {loading ? (
        <View className="items-center py-4">
          <ActivityIndicator color="#005E53" />
        </View>
      ) : !items || items.length === 0 ? (
        <View className="bg-caregiver-bg-secondary rounded-xl p-3">
          <Text className="text-sm text-caregiver-text-secondary text-center">
            오늘 등록된 일정이 없습니다.
          </Text>
        </View>
      ) : (
        items.map((schedule) => {
          const time = formatScheduleTime(schedule.scheduledAt);
          return (
            <View
              key={schedule.scheduleId ?? schedule.id}
              className="bg-caregiver-bg-secondary rounded-xl p-3 mb-2"
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-bold text-caregiver-text-primary flex-1 mr-2" numberOfLines={1}>
                  {schedule.title}
                </Text>
                {time ? (
                  <Text className="text-xs text-caregiver-text-secondary">{time}</Text>
                ) : null}
              </View>
              {schedule.content ? (
                <Text className="text-sm text-caregiver-text-secondary" numberOfLines={2}>
                  {schedule.content}
                </Text>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}
