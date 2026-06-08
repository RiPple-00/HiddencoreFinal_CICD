import React from "react";
import { Image, Pressable, View } from "react-native";
import Text from "../../Text";
import { useI18n } from "@/hooks/useI18n";

import HomeActiveIcon from "../../../../assets/caregiver/home-active.svg";
import HomeIcon from "../../../../assets/caregiver/home.svg";
import EmergencyIcon from "../../../../assets/caregiver/emergency.svg";

/** 하단 탭 바 높이(px) — App.jsx `paddingBottom`과 동기화 */
export const CAREGIVER_BOTTOM_TAB_HEIGHT = 76;

/**
 * 하단 고정 네비게이션 바.
 * 활성 탭은 active 로 하나만 지정 ("home" | "emergency")
 * @param {boolean} [qrDisabled] — true면 QR 체크 탭을 비활성 표시(탭은 누를 수 있으나 상위에서 안내 처리).
 */
export default function CaregiverBottomNav({
  active,
  onPressHome,
  onPressEmergency,
}) {
  const { t } = useI18n();
  return (
    <View className="h-[76px] bg-background-neutral border-t border-caregiver-button-secondary flex-row justify-around items-center pb-[6px]">

      <Pressable
        className="items-center flex-1"
        onPress={onPressHome}
        hitSlop={6}
      >
        {active === "home" ? (
          <HomeActiveIcon width={28} height={28} />
        ) : (
          <HomeIcon width={28} height={28} />
        )}

        <Text
          className={`mt-[2px] text-xs font-bold ${active === "home"
              ? "text-caregiver-text-primary"
              : "text-caregiver-text-secondary"
            }`}
        >
          {t("caregiver.tabs.home")}
        </Text>
      </Pressable>

      <Pressable
        className="items-center flex-1"
        onPress={onPressEmergency}
        hitSlop={6}
      >
        <View pointerEvents="none">
          <EmergencyIcon
            width={28}
            height={28}
          />
        </View>

        <Text className="mt-[2px] text-xs font-bold text-caregiver-text-secondary">
          {t("caregiver.tabs.emergency")}
        </Text>
      </Pressable>

    </View>
  );
}