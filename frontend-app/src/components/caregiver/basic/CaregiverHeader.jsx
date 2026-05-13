import React from "react";
import { Pressable, View } from "react-native";
import Text from "../../Text";

/** 상단 안전 영역 아래 헤더 줄 높이(px) — App.jsx `paddingTop`과 동기화 */
export const CAREGIVER_HEADER_INNER_HEIGHT = 56;

/**
 * 따숨 로고 + 알림/메뉴 아이콘이 들어간 상단 헤더.
 * onBack 이 있으면 뒤로가기 버튼이 노출된다.
 * rightSlot 이 있으면 우측 영역(알림/메뉴 대신)에 커스텀 노드를 넣는다.
 */
export default function CaregiverHeader({
  onBack,
  onPressNotification,
  onPressMenu,
  rightSlot,
}) {
  return (
    <View className="bg-background-neutral px-4 py-3 flex-row justify-between items-center border-b border-caregiver-button-secondary min-h-[56px]">
      <View className="flex-row items-center gap-2">
        {onBack ? (
          <Pressable
            onPress={onBack}
            className="w-[30px] h-[30px] rounded-full items-center justify-center bg-caregiver-bg-secondary"
            hitSlop={8}
          >
            <Text className="text-[22px] leading-[22px] text-caregiver-text-primary font-bold">
              ‹
            </Text>
          </Pressable>
        ) : null}
        <Text className="text-[18px]">🏥</Text>
        <Text className="text-[22px] font-extrabold text-caregiver-text-primary">
          따숨
        </Text>
      </View>

      {rightSlot ? (
        <View className="flex-row items-center">{rightSlot}</View>
      ) : (
        <View className="flex-row items-center">
          <Pressable onPress={onPressNotification} hitSlop={8}>
            <Text className="text-[18px]">🔔</Text>
          </Pressable>
          <Pressable onPress={onPressMenu} hitSlop={8} style={{ marginLeft: 14 }}>
            <Text className="text-[18px]">☰</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
