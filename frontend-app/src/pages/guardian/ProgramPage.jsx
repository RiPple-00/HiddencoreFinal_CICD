import React from "react";
import { View } from "react-native";
import GuardianProgramSection from "../../components/guardian/program/GuardianProgramSection";
import { styles } from "../../styles/guardianProgram.styles";

export default function ProgramPage() {
  return (
    <View style={styles.container}>
      <GuardianProgramSection />
    </View>
  );
}