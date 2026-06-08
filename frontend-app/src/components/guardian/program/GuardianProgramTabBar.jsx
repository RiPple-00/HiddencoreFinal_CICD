import React from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramTabBar({ tab, onChangeTab }) {
  const { t } = useI18n();
  return (
    <View style={styles.tabRow}>
      <TouchableOpacity
        style={[styles.tabButton, tab === "programs" && styles.tabButtonActive]}
        onPress={() => onChangeTab("programs")}
      >
        <Text style={[styles.tabText, tab === "programs" && styles.tabTextActive]}>
          {t("program.tab_list")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, tab === "applications" && styles.tabButtonActive]}
        onPress={() => onChangeTab("applications")}
      >
        <Text style={[styles.tabText, tab === "applications" && styles.tabTextActive]}>
          {t("program.tab_applications")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
