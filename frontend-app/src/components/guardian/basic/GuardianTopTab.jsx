import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";

/** 상단 안전 영역 아래 콘텐츠 줄 높이(px) — App.jsx `paddingTop`과 동기화 */
export const GUARDIAN_TOP_BAR_INNER_HEIGHT = 56;

function navigateGuardian(navigation, routeName, params) {
  if (!navigation) return;
  if (typeof navigation.navigate === "function") {
    navigation.navigate(routeName, params);
  }
}

export default function GuardianTopTab({ navigation }) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View
        pointerEvents="box-none"
        className="bg-background-neutral"
        style={[styles.barWrap, { paddingTop: insets.top }]}
      >
        <View className="flex-row flex-1 justify-between items-center px-5 py-4 border-b border-guardian-button-secondary">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl">🩺</Text>
            <Text className="text-lg font-extrabold text-guardian-text-primary">
              따숨
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => alert("알림 클릭")}>
              <Text className="text-xl">🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuOpen(true)}>
              <Text className="text-xl">☰</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {menuOpen ? (
        <View style={styles.menuLayer} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={1}
            style={[StyleSheet.absoluteFillObject, styles.menuBackdrop]}
            onPress={() => setMenuOpen(false)}
          />
          <View
            className="absolute right-0 bottom-0 w-64 bg-background-neutral p-6 border-l border-guardian-button-secondary"
            style={{ top: 0, paddingTop: insets.top + 12 }}
          >
            <Text className="text-lg font-extrabold text-guardian-text-primary mb-6">
              메뉴
            </Text>
            {[
              {
                label: "마이페이지",
                onPress: () => {
                  setMenuOpen(false);
                  navigateGuardian(navigation, "MyPage");
                },
              },
              { label: "설정", onPress: () => {} },
              { label: "로그아웃", onPress: () => {} },
            ].map(({ label, onPress }) => (
              <TouchableOpacity
                key={label}
                className="py-4 border-b border-guardian-button-secondary"
                onPress={onPress}
              >
                <Text className="font-bold text-guardian-text-primary">
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
  },
  menuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3000,
  },
  menuBackdrop: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
