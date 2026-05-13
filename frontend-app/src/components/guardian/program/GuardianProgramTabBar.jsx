// 컴포넌트 설명: 보호자 프로그램 섹션의 탭 바 (프로그램 목록 / 신청 내역)

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramTabBar({ tab, onChangeTab }) {
  return (
    <View style={styles.tabRow}>
      <TouchableOpacity
        style={[styles.tabButton, tab === "programs" && styles.tabButtonActive]}
        onPress={() => onChangeTab("programs")}
      >
        <Text
          style={[styles.tabText, tab === "programs" && styles.tabTextActive]}
        >
          프로그램 목록
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          tab === "applications" && styles.tabButtonActive,
        ]}
        onPress={() => onChangeTab("applications")}
      >
        <Text
          style={[
            styles.tabText,
            tab === "applications" && styles.tabTextActive,
          ]}
        >
          신청내역
        </Text>
      </TouchableOpacity>
    </View>
  );
}
