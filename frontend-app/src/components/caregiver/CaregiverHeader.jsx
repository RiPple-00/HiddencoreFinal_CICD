import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * 따숨 로고 + 알림/메뉴 아이콘이 들어간 상단 헤더.
 * onBack 이 있으면 뒤로가기 버튼이 노출된다.
 */
export default function CaregiverHeader({ onBack, onPressNotification, onPressMenu }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : null}
        <Text style={styles.logoIcon}>🏥</Text>
        <Text style={styles.logoText}>따숨</Text>
      </View>

      <View style={styles.right}>
        <Pressable onPress={onPressNotification} hitSlop={8}>
          <Text style={styles.iconText}>🔔</Text>
        </Pressable>
        <Pressable onPress={onPressMenu} hitSlop={8} style={{ marginLeft: 14 }}>
          <Text style={styles.iconText}>☰</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF2",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF3F8",
  },
  backText: {
    fontSize: 22,
    lineHeight: 22,
    color: "#274062",
    fontWeight: "700",
  },
  logoIcon: { fontSize: 18 },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E3A66",
  },
  iconText: {
    fontSize: 18,
    color: "#1E3A66",
  },
});
