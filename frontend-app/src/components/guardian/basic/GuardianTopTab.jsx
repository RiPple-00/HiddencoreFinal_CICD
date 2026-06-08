import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import AppSideMenu from "@/components/common/AppSideMenu";
import LanguageToggle from "@/components/common/LanguageToggle";
import { useI18n } from "@/hooks/useI18n";
import { clearAccessToken } from "@/api";

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
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await clearAccessToken();
      navigation?.dispatch?.(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "GuardianLogin" }],
        }),
      );
    } catch (error) {
      Alert.alert(t('menu.logout'), "다시 시도해주세요.");
    } finally {
      setMenuOpen(false);
    }
  };

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
          <View className="flex-row items-center gap-3">
            <LanguageToggle />
            <TouchableOpacity onPress={() => alert("알림 클릭")}>
              <Text className="text-xl">🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuOpen(true)}>
              <Text className="text-xl">☰</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <AppSideMenu
        visible={menuOpen}
        topInset={insets.top}
        onClose={() => setMenuOpen(false)}
        items={[
          {
            label: t('menu.my_page'),
            onPress: () => {
              setMenuOpen(false);
              navigateGuardian(navigation, "MyPage");
            },
          },
          {
            label: t('menu.settings'),
            onPress: () => {
              setMenuOpen(false);
              navigateGuardian(navigation, "Settings");
            },
          },
          {
            label: t('menu.logout'),
            onPress: handleLogout,
          },
        ]}
      />
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
});
