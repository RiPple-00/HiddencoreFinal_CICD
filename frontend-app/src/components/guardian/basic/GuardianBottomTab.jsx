import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useI18n } from "@/hooks/useI18n";

import HomeActiveIcon from "../../../../assets/guardian/home-active.svg";
import HomeIcon from "../../../../assets/guardian/home.svg";

import ScanActiveIcon from "../../../../assets/guardian/scan-active.svg";
import ScanIcon from "../../../../assets/guardian/scan.svg";

import CardActiveIcon from "../../../../assets/guardian/card-active.svg";
import CardIcon from "../../../../assets/guardian/card.svg";

import ReportActiveIcon from "../../../../assets/guardian/report-active.svg";
import ReportIcon from "../../../../assets/guardian/report.svg";

import ChatbotActiveIcon from "../../../../assets/guardian/chatbot-active.svg";
import ChatbotIcon from "../../../../assets/guardian/chatbot.svg";

const ICONS = {
  homeActive: HomeActiveIcon,
  home: HomeIcon,

  scanActive: ScanActiveIcon,
  scan: ScanIcon,

  cardActive: CardActiveIcon,
  card: CardIcon,

  reportActive: ReportActiveIcon,
  report: ReportIcon,

  chatbotActive: ChatbotActiveIcon,
  chatbot: ChatbotIcon,
};

export default function GuardianBottomTab({
  navigation,
  currentTab,
}) {
  const { t } = useI18n();

  const tabs = [
    {
      labelKey: "guardian.tabs.home",
      route: "GuardianMain",
      activeIcon: ICONS.homeActive,
      inactiveIcon: ICONS.home,
    },
    {
      labelKey: "guardian.tabs.scan",
      route: "MedicationQrScan",
      activeIcon: ICONS.scanActive,
      inactiveIcon: ICONS.scan,
    },
    {
      labelKey: "guardian.tabs.payment",
      route: "Payment",
      activeIcon: ICONS.cardActive,
      inactiveIcon: ICONS.card,
    },
    {
      labelKey: "guardian.tabs.live",
      route: "LiveCheck",
      activeIcon: ICONS.reportActive,
      inactiveIcon: ICONS.report,
    },
    {
      labelKey: "guardian.tabs.chatbot",
      route: "Chatbot",
      activeIcon: ICONS.chatbotActive,
      inactiveIcon: ICONS.chatbot,
    },
  ];

  return (
    <View className="flex-row justify-around bg-background-neutral border-t border-guardian-button-secondary py-3">
      {tabs.map(
        ({
          labelKey,
          route,
          activeIcon,
          inactiveIcon,
        }) => {
          const active = currentTab === route;

          const IconComponent = active
            ? activeIcon
            : inactiveIcon;

          return (
            <TouchableOpacity
              key={route}
              className="items-center"
              onPress={() =>
                navigation?.navigate?.(route)
              }
            >
              <IconComponent
                width={28}
                height={28}
              />

              <Text
                className={`text-[10px] font-bold mt-1 ${active
                    ? "text-guardian-text-secondary"
                    : "text-guardian-text-neutral"
                  }`}
              >
                {t(labelKey)}
              </Text>
            </TouchableOpacity>
          );
        }
      )}
    </View>
  );
}
