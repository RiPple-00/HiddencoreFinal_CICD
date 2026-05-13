// 컴포넌트 설명: 간병인 체크리스트의 각 섹션을 나타내는 컴포넌트. 섹션 제목과 해당 섹션의 체크 항목들을 포함한다.
import React from "react";
import { View } from "react-native";
import Text from "../Text";

export default function CaregiverCheckSection({ title, children }) {
  return (
    <View className="mb-3">
      <Text className="mb-2 text-caregiver-text-primary text-[25px] font-extrabold">{title}</Text>
      <View className="rounded-[14px] border border-caregiver-button-secondary bg-background-neutral overflow-hidden">
        {children}
      </View>
    </View>
  );
}