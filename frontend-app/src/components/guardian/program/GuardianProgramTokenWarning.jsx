// 컴포넌트 설명: 보호자 프로그램 신청 시 직원 계정으로 로그인된 경우 보여주는 경고 메시지

import React from "react";
import { Text, View } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramTokenWarning() {
  return (
    <View style={styles.tokenWarningBox}>
      <Text style={styles.tokenWarningText}>
        직원(요양사 등) 계정으로 로그인된 상태입니다. 프로그램 신청은 로그인 화면에서「보호자」탭을
        선택한 뒤 보호자 아이디로 로그인해 주세요.
      </Text>
    </View>
  );
}
