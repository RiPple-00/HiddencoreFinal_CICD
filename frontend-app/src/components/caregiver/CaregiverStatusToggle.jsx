import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * 정상 / 이상 두 개 버튼 한 쌍을 노출하는 컴포넌트.
 * - value: null | "normal" | "abnormal"
 * - onChange: (newValue) => void
 *
 * size:
 *   "md"  (기본) - 위생점검/상태 안정화 등 한 줄짜리 큰 토글
 *   "sm"  - 식사 그리드(3x3)에 들어가는 작은 토글
 */
export default function CaregiverStatusToggle({ value, onChange, size = "md" }) {
  const isNormal = value === "normal";
  const isAbnormal = value === "abnormal";
  const sizeStyles = size === "sm" ? smallStyles : mediumStyles;

  return (
    <View style={sizeStyles.wrap}>
      <Pressable
        onPress={() => onChange(isNormal ? null : "normal")}
        style={[
          sizeStyles.button,
          isNormal ? styles.normalActiveButton : styles.normalIdleButton,
        ]}
        hitSlop={6}
      >
        <Text
          style={[
            sizeStyles.text,
            isNormal ? styles.normalActiveText : styles.normalIdleText,
          ]}
        >
          정상
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange(isAbnormal ? null : "abnormal")}
        style={[
          sizeStyles.button,
          isAbnormal ? styles.abnormalActiveButton : styles.abnormalIdleButton,
        ]}
        hitSlop={6}
      >
        <Text
          style={[
            sizeStyles.text,
            isAbnormal ? styles.abnormalActiveText : styles.abnormalIdleText,
          ]}
        >
          이상
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // 정상 버튼 - 미선택 (파랑 외곽선)
  normalIdleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#3D6FE0",
  },
  normalIdleText: {
    color: "#3D6FE0",
  },
  // 정상 버튼 - 선택 (네이비 채움)
  normalActiveButton: {
    backgroundColor: "#1E3A66",
    borderColor: "#1E3A66",
  },
  normalActiveText: {
    color: "#FFFFFF",
  },
  // 이상 버튼 - 미선택 (회색 외곽선)
  abnormalIdleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D5DCE5",
  },
  abnormalIdleText: {
    color: "#7A8597",
  },
  // 이상 버튼 - 선택 (빨강 채움)
  abnormalActiveButton: {
    backgroundColor: "#E83042",
    borderColor: "#E83042",
  },
  abnormalActiveText: {
    color: "#FFFFFF",
  },
});

const mediumStyles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 6 },
  button: {
    minWidth: 56,
    borderRadius: 8,
    borderWidth: 1.2,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "700",
  },
});

const smallStyles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 4 },
  button: {
    minWidth: 44,
    borderRadius: 7,
    borderWidth: 1.1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
