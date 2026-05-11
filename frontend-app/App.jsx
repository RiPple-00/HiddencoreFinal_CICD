import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet, View } from "react-native";

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
import GalleryPage from "./src/pages/guardian/GalleryPage";
import ActivePhotoGalleryPage from "./src/pages/guardian/activePhoto/GalleryPage";
import GuardianMorePage from "./src/pages/guardian/activePhoto/GuardianMorePage";
import CaregiverMainPage from "./src/pages/caregiver/CaregiverMainPage";
import CaregiverWorkCheckPage from "./src/pages/caregiver/CaregiverWorkCheckPage";
import CaregiverPatientListPage from "./src/pages/caregiver/CaregiverPatientListPage";
import CaregiverTaskCheckPage from "./src/pages/caregiver/CaregiverTaskCheckPage";

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

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const content = (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GuardianLogin">
        <Stack.Screen name="GuardianLogin" component={GuardianLoginPage} options={{ title: "로그인" }} />
        <Stack.Screen name="GuardianMain" component={GuardianMainPage} options={{ headerShown: false }} />
        <Stack.Screen name="CaregiverMain" component={CaregiverMainPage} options={{ headerShown: false }} />
        <Stack.Screen name="CaregiverWorkCheck" component={CaregiverWorkCheckPage} options={{ headerShown: false }} />
        <Stack.Screen name="CaregiverTaskCheck" component={CaregiverTaskCheckPage} options={{ headerShown: false }} />
        <Stack.Screen name="CaregiverPatientList" component={CaregiverPatientListPage} options={{ headerShown: false }} />
        <Stack.Screen name="Report" component={ReportPage} options={{ title: "보고서 확인" }} />
        <Stack.Screen name="Consent" component={ConsentPage} options={{ title: "동의서 확인" }} />
        <Stack.Screen name="VisitApply" component={VisitApplyPage} options={{ title: "면회 신청" }} />
        <Stack.Screen name="Notice" component={NoticePage} options={{ title: "공지사항" }} />
        <Stack.Screen name="Calendar" component={CalendarPage} options={{ title: "달력" }} />
        <Stack.Screen name="Payment" component={PaymentPage} options={{ headerShown: false }} />

        {/* 수납 플로우 */}
        <Stack.Screen name="StoragePage" component={StoragePage} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentHistory" component={PaymentHistory} options={{ headerShown: false }} />
        <Stack.Screen name="StorageList" component={StorageList} options={{ headerShown: false }} />
        <Stack.Screen name="InvoicePaymentList" component={InvoicePaymentList} options={{ headerShown: false }} />
        <Stack.Screen name="StorageDetail" component={StorageDetail} options={{ headerShown: false }} />
        <Stack.Screen name="LiveCheck" component={LiveCheckPage} options={{ title: "실시간" }} />
        <Stack.Screen name="Chatbot" component={ChatbotPage} options={{ title: "챗봇" }} />
        <Stack.Screen name="MyPage" component={MyPage} options={{ title: "마이페이지" }} />
        <Stack.Screen name="Gallery" component={GalleryPage} options={{ title: "갤러리" }} />
        <Stack.Screen
          name="ActivePhotoGallery"
          component={ActivePhotoGalleryPage}
          options={{ title: "활동 사진" }}
        />
        <Stack.Screen name="GalleryMore" component={GuardianMorePage} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  if (Platform.OS !== "web") return content;

  return (
    <View style={webFrameStyles.page}>
      <View style={webFrameStyles.frame}>{content}</View>
    </View>
  );
}

const webFrameStyles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F4F6F8",
  },
  frame: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "#F4F6F8",
  },
});
