import React from "react";
import { View } from "react-native";
import GuardianProgramSection from "./GuardianProgramApplicationPage";
import { styles } from "../../styles/guardianProgram.styles";

export default function ProgramPage() {
  return (
    <View style={styles.container}>
      <GuardianProgramSection />
    </View>
  );
}