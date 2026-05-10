import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * 하단 고정 네비게이션 바.
 * 활성 탭은 active prop 으로 지정 ("home" | "qr" | "emergency").
 */
export default function CaregiverBottomNav({
  active = "qr",
  onPressHome,
  onPressQr,
  onPressEmergency,
}) {
  return (
    <View style={styles.bottomNav}>
      <Pressable style={styles.bottomItem} onPress={onPressHome} hitSlop={6}>
        <Text style={styles.iconText}>🏠</Text>
        <Text
          style={[
            styles.bottomLabel,
            active === "home" && styles.bottomLabelActive,
          ]}
        >
          홈
        </Text>
      </Pressable>

      <Pressable style={styles.bottomItem} onPress={onPressQr} hitSlop={6}>
        <View
          style={[
            styles.qrIconWrap,
            active === "qr" && styles.qrIconWrapActive,
          ]}
        >
          <Text style={styles.iconText}>📷</Text>
        </View>
        <Text
          style={[
            styles.bottomLabel,
            active === "qr" && styles.bottomLabelQr,
          ]}
        >
          QR 체크
        </Text>
      </Pressable>

      <Pressable style={styles.bottomItem} onPress={onPressEmergency} hitSlop={6}>
        <Text style={styles.iconText}>📞</Text>
        <Text
          style={[
            styles.bottomLabel,
            active === "emergency" && styles.bottomLabelEmergency,
          ]}
        >
          긴급 호출
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    height: 76,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#D8E1EE",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 6,
  },
  bottomItem: {
    alignItems: "center",
    flex: 1,
  },
  iconText: {
    fontSize: 18,
  },
  qrIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  qrIconWrapActive: {
    backgroundColor: "#1E3A66",
  },
  bottomLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#7A8BA2",
  },
  bottomLabelActive: {
    color: "#1E3A66",
  },
  bottomLabelQr: {
    color: "#1E3A66",
  },
  bottomLabelEmergency: {
    color: "#C13E48",
  },
});
