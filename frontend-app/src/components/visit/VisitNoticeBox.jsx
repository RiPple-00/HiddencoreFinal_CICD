// 면회 안내 문구
// 지각 시 불가 안내
// 병원 정책 안내

import React from "react";
import { View, } from "react-native";
import Text from "../Text";

const NOTICES = [
  "면회 시간은 10:00 ~ 18:00입니다.",
  "지각 시 면회가 불가할 수 있습니다.",
  "병원 정책에 따라 면회가 제한될 수 있습니다.",
];

const VisitNoticeBox = () => {
  return (
    <View className="bg-guardian-button-secondary border border-guardian-button-primary rounded-xl p-5 my-5">
      <Text className="text-base font-extrabold text-guardian-text-primary mb-3">
        ⓘ 면회 안내
      </Text>
      <View className="gap-[5px]">
        {NOTICES.map((notice, i) => (
          <Text key={i} className="text-sm text-guardian-text-neutral leading-5">
            • {notice}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default VisitNoticeBox;