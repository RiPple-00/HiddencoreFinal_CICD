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