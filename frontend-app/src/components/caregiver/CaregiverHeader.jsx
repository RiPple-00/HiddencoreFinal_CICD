import React from "react";
import { Pressable, View } from "react-native";
import Text from "../Text";

/**
 * 따숨 로고 + 알림/메뉴 아이콘이 들어간 상단 헤더.
 * onBack 이 있으면 뒤로가기 버튼이 노출된다.
 */
export default function CaregiverHeader({ onBack, onPressNotification, onPressMenu }) {
  return (
    <View className="bg-background-neutral px-4 pt-[14px] pb-3 flex-row justify-between items-center border-b border-caregiver-button-secondary">
      <View className="flex-row items-center gap-2">
        {onBack && (
          <Pressable
            onPress={onBack}
            className="w-[30px] h-[30px] rounded-full items-center justify-center bg-caregiver-bg-secondary"
            hitSlop={8}
          >
            <Text className="text-[22px] leading-[22px] text-caregiver-text-primary font-bold">‹</Text>
          </Pressable>
        )}
        <Text className="text-[18px]">🏥</Text>
        <Text className="text-[22px] font-extrabold text-caregiver-text-primary">따숨</Text>
      </View>

      <View className="flex-row items-center">
        <Pressable onPress={onPressNotification} hitSlop={8}>
          <Text className="text-[18px]">🔔</Text>
        </Pressable>
        <Pressable onPress={onPressMenu} hitSlop={8} style={{ marginLeft: 14 }}>
          <Text className="text-[18px]">☰</Text>
        </Pressable>
      </View>
    </View>
  );
}