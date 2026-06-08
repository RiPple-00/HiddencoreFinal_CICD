import React from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";

const ACTION_ITEMS = [
  { icon: "📄", labelKey: "guardian.actions.report", route: "Report" },
  { icon: "📝", labelKey: "guardian.actions.consent", route: "Consent" },
  { icon: "🤝", labelKey: "guardian.actions.visit", route: "VisitApply" },
  { icon: "🎯", labelKey: "guardian.actions.program", route: "Program" },
];

export default function GuardianButton({ navigation }) {
  const { t } = useI18n();
  return (
    <View className="flex-row flex-wrap gap-3 mx-5 mt-5">
      {ACTION_ITEMS.map(({ icon, labelKey, route }) => (
        <TouchableOpacity
          key={route}
          className="w-[47%] flex-grow bg-background-neutral items-center py-4 rounded-2xl"
          onPress={() => navigation.navigate(route)}
        >
          <Text className="text-2xl">{icon}</Text>
          <Text className="text-xs font-bold text-guardian-text-primary mt-2 text-center">
            {t(labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
