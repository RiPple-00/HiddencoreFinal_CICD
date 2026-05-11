// 날짜/시간
// 환자명
// 병실
// 면회 유형
// 상태 배지
// 클릭 시 상세 페이지로 이동

import React from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "../Text";

// 상태별 배지 색상
const STATUS_STYLE = {
  승인:     { bg: "bg-success-secondary",         text: "text-success-primary" },
  대기:     { bg: "bg-guardian-button-secondary",  text: "text-guardian-text-primary" },
  거절:     { bg: "bg-error-secondary",            text: "text-error-primary" },
};

const VisitRequestCard = ({ visit, navigation }) => {
  const handlePress = () => {
    navigation?.navigate("VisitDetail", { visitId: visit.id });
  };

  const statusStyle = STATUS_STYLE[visit.status] ?? STATUS_STYLE["대기"];

  return (
    <TouchableOpacity
      className="bg-background-neutral border border-guardian-button-secondary rounded-xl p-4 mb-[10px]"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View className="flex-col gap-[6px]">

        {/* 날짜/시간 + 상태 배지 */}
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-guardian-text-neutral">
            {visit.date}
          </Text>
          {visit.status && (
            <View className={`px-2 py-[3px] rounded-full ${statusStyle.bg}`}>
              <Text className={`text-[11px] font-bold ${statusStyle.text}`}>
                {visit.status}
              </Text>
            </View>
          )}
        </View>

        {/* 환자명 */}
        <Text className="text-base font-extrabold text-guardian-text-primary">
          {visit.patientName}
        </Text>

        {/* 병실 · 면회 유형 */}
        <View className="flex-row gap-2">
          <Text className="text-sm text-guardian-text-neutral">{visit.room}</Text>
          <Text className="text-sm text-guardian-text-neutral">·</Text>
          <Text className="text-sm text-guardian-text-neutral">{visit.type}</Text>
        </View>

      </View>
    </TouchableOpacity>
  );
};

export default VisitRequestCard;