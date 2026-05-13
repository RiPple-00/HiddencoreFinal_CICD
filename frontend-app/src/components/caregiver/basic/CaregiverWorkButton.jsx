import React from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "../../Text";

/**
 * 업무 체크 / 환자 목록 / 사진 업로드 바로가기.
 */
export default function CaregiverWorkButton({
  onPressWorkCheck,
  onPressPatientList,
  onPressPhoto,
}) {
  const buttons = [
    { icon: "📋", label: "업무 체크", onPress: onPressWorkCheck },
    { icon: "📂", label: "환자 목록", onPress: onPressPatientList },
    { icon: "🗓️", label: "사진 업로드", onPress: onPressPhoto },
  ];

  return (
    <View className="mx-4 mt-4 flex-row justify-between gap-3">
      {buttons.map(({ icon, label, onPress }) => (
        <TouchableOpacity
          key={label}
          className="flex-1 bg-background-neutral rounded-2xl items-center py-4"
          onPress={onPress ?? undefined}
        >
          <Text className="text-xl">{icon}</Text>
          <Text className="text-xs font-bold text-caregiver-text-primary mt-2">
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
