import React, { useMemo, useState } from "react";
import {
  CommonActions,
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import GuardianLoginPage from "./src/pages/auth/GuardianLoginPage";
import GuardianMainPage from "./src/pages/guardian/GuardianMainPage";
import ReportPage from "./src/pages/guardian/ReportPage";
import ConsentPage from "./src/pages/guardian/ConsentPage";
import VisitApplyPage from "./src/pages/guardian/VisitApplyPage";
import NoticePage from "./src/pages/guardian/NoticePage";
import CalendarPage from "./src/pages/guardian/CalendarPage";
import PaymentPage from "./src/pages/guardian/PaymentPage";
import LiveCheckPage from "./src/pages/guardian/LiveCheckPage";
import ChatbotPage from "./src/pages/guardian/ChatbotPage";
import MyPage from "./src/pages/guardian/MyPage";
import SettingsPage from "./src/pages/guardian/SettingsPage";
import GalleryPage from "./src/pages/guardian/GalleryPage";
import ActivePhotoGalleryPage from "./src/pages/guardian/activePhoto/GalleryPage";
import GuardianMorePage from "./src/pages/guardian/activePhoto/GuardianMorePage";
import CaregiverMainPage from "./src/pages/caregiver/CaregiverMainPage";
import CaregiverPatientListPage from "./src/pages/caregiver/CaregiverPatientListPage";
import CaregiverTaskCheckPage from "./src/pages/caregiver/CaregiverTaskCheckPage";
import CaregiverPhotoUploadPage from "./src/pages/caregiver/CaregiverPhotoUploadPage";
import ProgramPage from "./src/pages/guardian/ProgramPage";
import MedicationQrScanPage from "./src/pages/guardian/MedicationQrScanPage";
import MedicationHistoryPage from "./src/pages/guardian/MedicationHistoryPage";
import MedicationHistoryDetailPage from "./src/pages/guardian/MedicationHistoryDetailPage";

import StoragePage from "./src/pages/billing/StoragePage";
import StorageList from "./src/components/billing/StorageList";
import StorageDetail from "./src/components/billing/StorageDetail";
import PaymentHistory from "./src/components/billing/PaymentHistory";
import InvoicePaymentList from "./src/components/billing/InvoicePaymentList";

import { useFonts } from "expo-font";
import {
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import "./global.css";
import GuardianBottomTab from "./src/components/guardian/basic/GuardianBottomTab";
import GuardianTopTab, {
  GUARDIAN_TOP_BAR_INNER_HEIGHT,
} from "./src/components/guardian/basic/GuardianTopTab";
import CaregiverBottomNav, {
  CAREGIVER_BOTTOM_TAB_HEIGHT,
} from "./src/components/caregiver/basic/CaregiverBottomNav";
import CaregiverHeader, {
  CAREGIVER_HEADER_INNER_HEIGHT,
} from "./src/components/caregiver/basic/CaregiverHeader";
import { G } from "./src/styles/guardianTheme";
import { clearAccessToken } from "./src/api";
import AppSideMenu from "./src/components/common/AppSideMenu";
import LanguageToggle from "./src/components/common/LanguageToggle";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { useI18n } from "./src/hooks/useI18n";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

const MAIN_GUARDIAN_TABS = new Set([
  "GuardianMain",
  "MedicationQrScan",
  "Payment",
  "LiveCheck",
  "Chatbot",
]);

const GUARDIAN_SCREENS = new Set([
  "GuardianMain",
  "Report",
  "Consent",
  "VisitApply",
  "Notice",
  "Calendar",
  "MedicationQrScan",
  "Payment",
  "Program",
  "StoragePage",
  "PaymentHistory",
  "StorageList",
  "InvoicePaymentList",
  "StorageDetail",
  "LiveCheck",
  "Chatbot",
  "MyPage",
  "Gallery",
  "ActivePhotoGallery",
  "GalleryMore",
  "MedicationHistory",
  "MedicationHistoryDetail",
]);

const BOTTOM_TAB_HEIGHT = 72;

const CAREGIVER_SCREENS = new Set([
  "CaregiverMain",
  "CaregiverTaskCheck",
  "CaregiverPatientList",
  "CaregiverPhotoUpload",
]);

function CaregiverAppHeader({ navigationRef, currentRouteName, onOpenMenu }) {
  const insets = useSafeAreaInsets();

  const onBack =
    currentRouteName &&
    currentRouteName !== "CaregiverMain" &&
    navigationRef.isReady() &&
    navigationRef.canGoBack()
      ? () => navigationRef.goBack()
      : undefined;

  const rightContent = (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <LanguageToggle />
      <Pressable
        onPress={() => Alert.alert("알림", "알림 목록은 준비 중입니다.")}
        hitSlop={8}
        style={{ marginLeft: 14 }}
      >
        <Text style={{ fontSize: 18 }}>🔔</Text>
      </Pressable>
      <Pressable onPress={onOpenMenu} hitSlop={8} style={{ marginLeft: 14 }}>
        <Text style={{ fontSize: 18 }}>☰</Text>
      </Pressable>
    </View>
  );

  return (
    <View
      className="bg-background-neutral"
      style={[
        styles.caregiverHeaderWrap,
        {
          paddingTop: insets.top,
          ...Platform.select({
            android: { elevation: 28 },
            default: {},
          }),
        },
      ]}
    >
      <CaregiverHeader
        onBack={onBack}
        rightSlot={rightContent}
      />
    </View>
  );
}

function AppNavigation() {
  const insets = useSafeAreaInsets();
  useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const [currentRouteName, setCurrentRouteName] = useState(null);
  const [caregiverMenuOpen, setCaregiverMenuOpen] = useState(false);

  const showGuardianChrome = useMemo(() => {
    if (!currentRouteName) return false;
    return GUARDIAN_SCREENS.has(currentRouteName);
  }, [currentRouteName]);

  const currentTab = useMemo(() => {
    if (!currentRouteName) return null;
    return MAIN_GUARDIAN_TABS.has(currentRouteName) ? currentRouteName : null;
  }, [currentRouteName]);

  const guardianTopInset = insets.top + GUARDIAN_TOP_BAR_INNER_HEIGHT;

  const showCaregiverChrome = useMemo(() => {
    if (!currentRouteName) return false;
    return CAREGIVER_SCREENS.has(currentRouteName);
  }, [currentRouteName]);

  const caregiverActiveTab = useMemo(() => {
    if (!currentRouteName) return undefined;
    if (currentRouteName === "CaregiverMain") return "home";
    return undefined;
  }, [currentRouteName]);

  const caregiverTopInset = insets.top + CAREGIVER_HEADER_INNER_HEIGHT;

  const showLanguageToggle = !showGuardianChrome && !showCaregiverChrome;

  const handleCaregiverLogout = async () => {
    try {
      await clearAccessToken();
      setCaregiverMenuOpen(false);
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "GuardianLogin" }],
        }),
      );
    } catch (error) {
      Alert.alert("로그아웃 실패", "다시 시도해주세요.");
    }
  };

  const { t } = useI18n();

  const content = (
    <NavigationContainer
      ref={navigationRef}
      documentTitle={{
        enabled: Platform.OS === "web",
        formatter: () => "따숨",
      }}
      onReady={() => {
        const route = navigationRef.getCurrentRoute();
        setCurrentRouteName(route?.name ?? null);
      }}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute();
        setCurrentRouteName(route?.name ?? null);
      }}
    >
      <View style={styles.appRoot}>
        {showLanguageToggle && (
          <View style={[styles.languageToggleContainer, { top: insets.top + 12 }]}> 
            <LanguageToggle />
          </View>
        )}
        <View
          style={[
            styles.navigatorFrame,
            showGuardianChrome
              ? { paddingBottom: BOTTOM_TAB_HEIGHT, paddingTop: guardianTopInset }
              : null,
            showCaregiverChrome
              ? {
                  paddingBottom: CAREGIVER_BOTTOM_TAB_HEIGHT,
                  paddingTop: caregiverTopInset,
                }
              : null,
          ]}
        >
          <Stack.Navigator initialRouteName="GuardianLogin">
            <Stack.Screen
              name="GuardianLogin"
              component={GuardianLoginPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GuardianMain"
              component={GuardianMainPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CaregiverMain"
              component={CaregiverMainPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CaregiverTaskCheck"
              component={CaregiverTaskCheckPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CaregiverPatientList"
              component={CaregiverPatientListPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CaregiverPhotoUpload"
              component={CaregiverPhotoUploadPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Report"
              component={ReportPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Consent"
              component={ConsentPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="VisitApply"
              component={VisitApplyPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notice"
              component={NoticePage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Calendar"
              component={CalendarPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MedicationQrScan"
              component={MedicationQrScanPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MedicationHistory"
              component={MedicationHistoryPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MedicationHistoryDetail"
              component={MedicationHistoryDetailPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Program"
              component={ProgramPage}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="StoragePage"
              component={StoragePage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PaymentHistory"
              component={PaymentHistory}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StorageList"
              component={StorageList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InvoicePaymentList"
              component={InvoicePaymentList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StorageDetail"
              component={StorageDetail}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LiveCheck"
              component={LiveCheckPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chatbot"
              component={ChatbotPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MyPage"
              component={MyPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Gallery"
              component={GalleryPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ActivePhotoGallery"
              component={ActivePhotoGalleryPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GalleryMore"
              component={GuardianMorePage}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </View>

        {showGuardianChrome && (
          <View style={styles.bottomTabContainer}>
            <GuardianBottomTab
              navigation={navigationRef}
              currentTab={currentTab}
            />
          </View>
        )}

        {showGuardianChrome && (
          <GuardianTopTab navigation={navigationRef} />
        )}

        {showCaregiverChrome && (
          <CaregiverAppHeader
            navigationRef={navigationRef}
            currentRouteName={currentRouteName}
            onOpenMenu={() => setCaregiverMenuOpen(true)}
          />
        )}

        {showCaregiverChrome && (
          <AppSideMenu
            visible={caregiverMenuOpen}
            topInset={insets.top}
            onClose={() => setCaregiverMenuOpen(false)}
            items={[
              {
                label: t('menu.my_page'),
                onPress: () => {
                  setCaregiverMenuOpen(false);
                  Alert.alert(t('menu.my_page'), "요양사 마이페이지는 준비 중입니다.");
                },
              },
              {
                label: t('menu.settings'),
                onPress: () => {
                  setCaregiverMenuOpen(false);
                  Alert.alert(t('menu.settings'), "설정 기능은 준비 중입니다.");
                },
              },
              {
                label: t('menu.logout'),
                onPress: handleCaregiverLogout,
              },
            ]}
          />
        )}

        {showCaregiverChrome && (
          <View style={styles.bottomTabContainer}>
            <CaregiverBottomNav
              active={caregiverActiveTab}
              onPressHome={() => navigationRef.navigate("CaregiverMain")}
              onPressEmergency={() =>
                Alert.alert("긴급 호출", "담당실 연동은 준비 중입니다.")
              }
            />
          </View>
        )}
      </View>
    </NavigationContainer>
  );

  if (Platform.OS !== "web") return content;

  return (
    <View style={webFrameStyles.page}>
      <View style={webFrameStyles.frame}>{content}</View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppNavigation />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  languageToggleContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 2000,
  },
  navigatorFrame: {
    flex: 1,
  },
  caregiverHeaderWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
  },
  bottomTabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});

const webFrameStyles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    backgroundColor: G.bgPrimary,
  },
  frame: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: G.bgPrimary,
  },
});
