import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

export default function GuardianBottomTab({
  navigation,
  currentTab,
}) {
  const tabs = [
    {
      label: "홈",
      route: "GuardianMain",
      activeIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/home-active.svg"),
      inactiveIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/home.svg"),
    },
    {
      label: "달력",
      route: "Calendar",
      activeIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/calendar-active.svg"),
      inactiveIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/calendar.svg"),
    },
    {
      label: "수납",
      route: "Payment",
      activeIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/card-active.svg"),
      inactiveIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/card.svg"),
    },
    {
      label: "실시간",
      route: "LiveCheck",
      activeIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/report-active.svg"),
      inactiveIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/report.svg"),
    },
    {
      label: "챗봇",
      route: "Chatbot",
      activeIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/chatbot-active.svg"),
      inactiveIcon: require("C:/Gabia2026/FinalProject/HiddencoreFinal/frontend-app/assets/guardian/chatbot.svg"),
    },
  ];

  return (
    <View className="flex-row justify-around bg-background-neutral border-t border-guardian-button-secondary py-3">
      {tabs.map(
        ({
          label,
          route,
          activeIcon,
          inactiveIcon,
        }) => {
          const active =
            currentTab === route;

          return (
            <TouchableOpacity
              key={label}
              className="items-center"
              onPress={() =>
                navigation?.navigate?.(route)
              }
            >
              <Image
                source={
                  active
                    ? activeIcon
                    : inactiveIcon
                }
                className="w-7 h-7"
                resizeMode="contain"
              />

              <Text
                className={`text-[10px] font-bold mt-1 ${
                  active
                    ? "text-guardian-text-secondary"
                    : "text-guardian-text-neutral"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }
      )}
    </View>
  );
}