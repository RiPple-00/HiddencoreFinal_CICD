import React from "react";
import { View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramTokenWarning() {
  const { t } = useI18n();
  return (
    <View style={styles.tokenWarningBox}>
      <Text style={styles.tokenWarningText}>{t("program.token_warning")}</Text>
    </View>
  );
}
