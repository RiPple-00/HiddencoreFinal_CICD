// 상태 표시 배지

import React from "react";
import { View, } from "react-native";
import Text from "../Text";

const STATUS_STYLE = {
  "승인":      { bg: "bg-success-secondary",        text: "text-success-primary" },
  "승인 대기": { bg: "bg-guardian-button-secondary", text: "text-guardian-text-primary" },
  "반려":      { bg: "bg-error-secondary",           text: "text-error-primary" },
};

const VisitStatusBadge = ({ status }) => {
  const style = STATUS_STYLE[status] ?? { bg: "bg-guardian-bg-secondary", text: "text-guardian-text-neutral" };

  return (
    <View className={`px-[10px] py-[5px] rounded-full self-start ${style.bg}`}>
      <Text className={`text-xs font-bold ${style.text}`}>
        {status}
      </Text>
    </View>
  );
};

export default VisitStatusBadge;