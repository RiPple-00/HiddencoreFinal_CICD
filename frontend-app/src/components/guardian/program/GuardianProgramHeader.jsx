// 컴포넌트 설명: 보호자 프로그램 신청 섹션 헤더

import React from "react";
import { Text, View } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramHeader() {
  return (
    <View style={styles.programSectionHeader}>
      <Text style={styles.programSectionTitle}>프로그램 신청</Text>
      <Text style={styles.programSectionSubtitle}>
        보호자님이 환자 대신 프로그램을 신청할 수 있어요.
      </Text>
    </View>
  );
}
