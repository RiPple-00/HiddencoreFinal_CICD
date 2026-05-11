import React from "react";
import { View } from "react-native";
import Text from "../Text";

/**
 * "김따숨 (M/82)" + "441212 · Ward 402 · 72283944" 형태의 환자 정보 스트립.
 *
 * props:
 *   name      : "김따숨"
 *   genderAge : "M/82"   (선택)
 *   metaItems : ["441212", "Ward 402", "72283944"]
 *   onPressIdCard : 우측 ID 아이콘 클릭 핸들러(선택)
 */
export default function CaregiverPatientStrip({ name, genderAge, metaItems = [], onPressIdCard }) {
  const compositeName = genderAge ? `${name} (${genderAge})` : name;
  const meta = metaItems.filter(Boolean).join(" · ");

  return (
    <View className="bg-caregiver-bg-secondary border-t border-b border-caregiver-button-secondary px-4 py-[10px] flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-[22px] font-extrabold text-caregiver-text-primary">{compositeName}</Text>
        {meta ? <Text className="mt-[2px] text-xs text-caregiver-text-secondary">{meta}</Text> : null}
      </View>
      <Text onPress={onPressIdCard} className="text-[22px]">🪪</Text>
    </View>
  );
}