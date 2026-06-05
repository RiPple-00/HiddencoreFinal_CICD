import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

const ICONS = {
  homeActive: require("../../../../assets/guardian/home-active.svg"),
  home: require("../../../../assets/guardian/home.svg"),
  scanActive: require("../../../../assets/guardian/scan-active.svg"),
  scan: require("../../../../assets/guardian/scan.svg"),
  cardActive: require("../../../../assets/guardian/card-active.svg"),
  card: require("../../../../assets/guardian/card.svg"),
  reportActive: require("../../../../assets/guardian/report-active.svg"),
  report: require("../../../../assets/guardian/report.svg"),
  chatbotActive: require("../../../../assets/guardian/chatbot-active.svg"),
  chatbot: require("../../../../assets/guardian/chatbot.svg"),
};

export default function GuardianBottomTab({
  navigation,
  currentTab,
}) {
  const tabs = [
    {
      label: "홈",
      route: "GuardianMain",
      activeIcon: ICONS.homeActive,
      inactiveIcon: ICONS.home,
    },
    {
      label: "스캔",
      route: "MedicationQrScan",
      activeIcon: ICONS.scanActive,
      inactiveIcon: ICONS.scan,
    },
    {
      label: "수납",
      route: "Payment",
      activeIcon: ICONS.cardActive,
      inactiveIcon: ICONS.card,
    },
    {
      label: "실시간",
      route: "LiveCheck",
      activeIcon: ICONS.reportActive,
      inactiveIcon: ICONS.report,
    },
    {
      label: "챗봇",
      route: "Chatbot",
      activeIcon: ICONS.chatbotActive,
      inactiveIcon: ICONS.chatbot,
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
