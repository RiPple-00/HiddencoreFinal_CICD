import React from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "@/components/Text";

const ACTION_ITEMS = [
  { icon: "📄", label: "보고서 확인", route: "Report" },
  { icon: "📝", label: "동의서 확인", route: "Consent" },
  { icon: "🤝", label: "면회 신청", route: "VisitApply" },
  { icon: "🎯", label: "프로그램 신청", route: "Program" },
];

export default function GuardianButton({ navigation }) {
  return (
    <View className="flex-row flex-wrap gap-3 mx-5 mt-5">
      {ACTION_ITEMS.map(({ icon, label, route }) => (
        <TouchableOpacity
          key={label}
          className="w-[47%] flex-grow bg-background-neutral items-center py-4 rounded-2xl"
          onPress={() => navigation.navigate(route)}
        >
          <Text className="text-2xl">{icon}</Text>
          <Text className="text-xs font-bold text-guardian-text-primary mt-2 text-center">
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
