import React from "react";
import { Pressable, View } from "react-native";
import Text from "../Text";

/**
 * 하단 고정 네비게이션 바.
 * 활성 탭은 active prop 으로 지정 ("home" | "qr" | "emergency").
 */
export default function CaregiverBottomNav({ active = "qr", onPressHome, onPressQr, onPressEmergency }) {
  return (
    <View className="h-[76px] bg-background-neutral border-t border-caregiver-button-secondary flex-row justify-around items-center pb-[6px]">

      <Pressable className="items-center flex-1" onPress={onPressHome} hitSlop={6}>
        <Text className="text-[18px]">🏠</Text>
        <Text className={`mt-[2px] text-xs font-bold ${active === "home" ? "text-caregiver-text-primary" : "text-caregiver-text-secondary"}`}>
          홈
        </Text>
      </Pressable>

      <Pressable className="items-center flex-1" onPress={onPressQr} hitSlop={6}>
        <View className={`w-11 h-11 rounded-full items-center justify-center ${active === "qr" ? "bg-caregiver-button-primary" : "bg-background-neutral"}`}>
          <Text className="text-[18px]">📷</Text>
        </View>
        <Text className={`mt-[2px] text-xs font-bold ${active === "qr" ? "text-caregiver-text-primary" : "text-caregiver-text-secondary"}`}>
          QR 체크
        </Text>
      </Pressable>

      <Pressable className="items-center flex-1" onPress={onPressEmergency} hitSlop={6}>
        <Text className="text-[18px]">📞</Text>
        <Text className={`mt-[2px] text-xs font-bold ${active === "emergency" ? "text-error-primary" : "text-caregiver-text-secondary"}`}>
          긴급 호출
        </Text>
      </Pressable>

    </View>
  );
}