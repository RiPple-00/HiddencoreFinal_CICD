import React from "react";
import { Image, Pressable, View } from "react-native";
import Text from "../../Text";

const HOME_ACTIVE = require("../../../../assets/guardian/home-active.svg");
const HOME_INACTIVE = require("../../../../assets/guardian/home.svg");

/** 하단 탭 바 높이(px) — App.jsx `paddingBottom`과 동기화 */
export const CAREGIVER_BOTTOM_TAB_HEIGHT = 76;

/**
 * 하단 고정 네비게이션 바.
 * 활성 탭은 active 로 하나만 지정 ("home" | "qr" | "emergency" | 생략 시 비활성만).
 * @param {boolean} [qrDisabled] — true면 QR 체크 탭을 비활성 표시(탭은 누를 수 있으나 상위에서 안내 처리).
 */
export default function CaregiverBottomNav({
  active,
  onPressHome,
  onPressQr,
  onPressEmergency,
  qrDisabled = false,
}) {
  return (
    <View className="h-[76px] bg-background-neutral border-t border-caregiver-button-secondary flex-row justify-around items-center pb-[6px]">

      <Pressable className="items-center flex-1" onPress={onPressHome} hitSlop={6}>
        <Image
          source={active === "home" ? HOME_ACTIVE : HOME_INACTIVE}
          className="w-7 h-7"
          resizeMode="contain"
        />
        <Text className={`mt-[2px] text-xs font-bold ${active === "home" ? "text-caregiver-text-primary" : "text-caregiver-text-secondary"}`}>
          홈
        </Text>
      </Pressable>

      <Pressable
        className={`items-center flex-1 ${qrDisabled ? "opacity-45" : ""}`}
        onPress={onPressQr}
        hitSlop={6}
      >
        <View
          className={`w-11 h-11 rounded-full items-center justify-center ${
            !qrDisabled && active === "qr" ? "bg-caregiver-button-primary" : "bg-background-neutral"
          }`}
        >
          <Text className="text-[18px]">📷</Text>
        </View>
        <Text
          className={`mt-[2px] text-xs font-bold ${
            !qrDisabled && active === "qr" ? "text-caregiver-text-primary" : "text-caregiver-text-secondary"
          }`}
        >
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