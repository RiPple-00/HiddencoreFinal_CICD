import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * 섹션 한 단위 (이모지 아이콘 + 한글/영문 타이틀 + 카드 박스).
 *
 * <icon> 식사 (Meal)
 * ┌────────────────────────────────┐
 * │ children ...                  │
 * └────────────────────────────────┘
 */
export default function CaregiverSectionCard({ icon, title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    paddingHorizontal: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    gap: 6,
  },
  icon: {
    fontSize: 18,
    color: "#1F3552",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F3552",
  },
  subtitle: {
    marginLeft: 4,
    fontSize: 12,
    color: "#7A8BA2",
    paddingBottom: 2,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
});
