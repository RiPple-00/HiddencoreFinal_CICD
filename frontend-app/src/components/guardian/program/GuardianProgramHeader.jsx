import React from "react";
import { View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramHeader() {
  const { t } = useI18n();
  return (
    <View style={styles.programSectionHeader}>
      <Text style={styles.programSectionTitle}>{t("program.title")}</Text>
      <Text style={styles.programSectionSubtitle}>{t("program.subtitle")}</Text>
    </View>
  );
}
