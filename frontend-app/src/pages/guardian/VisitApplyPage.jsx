import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import visitApi from "@/api/visitApi";
import GuardianVisitApplicationsTab from "@/components/guardian/visit/GuardianVisitApplicationsTab";
import GuardianVisitTabBar from "@/components/guardian/visit/GuardianVisitTabBar";
import VisitReservationPage from "./visit/VisitReservationPage";
import { styles } from "@/styles/guardianProgram.styles";
import { G } from "@/styles/guardianTheme";

export default function VisitApplyPage({ navigation }) {
  const { t } = useI18n();
  const [tab, setTab] = useState("apply");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await visitApi.getGuardianVisitApplications();
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("면회 신청내역 조회 실패", error);
      setApplications([]);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await fetchApplications();
    } finally {
      setLoading(false);
    }
  }, [fetchApplications]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchApplications();
    } finally {
      setRefreshing(false);
    }
  }, [fetchApplications]);

  const handleApplyComplete = useCallback(async () => {
    await fetchApplications();
    setTab("applications");
  }, [fetchApplications]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 22, color: G.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { flex: 1, textAlign: "center" }]}>
          {t("visit.title")}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={[styles.pageSubtitle, { paddingHorizontal: 20, marginTop: 6 }]}>
        {t("visit.subtitle")}
      </Text>

      <GuardianVisitTabBar tab={tab} onChangeTab={setTab} />

      {tab === "apply" ? (
        <VisitReservationPage
          embedded
          onBack={() => navigation.goBack()}
          onComplete={handleApplyComplete}
        />
      ) : loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={G.textSecondary} />
          <Text style={styles.loadingText}>{t("visit.loading")}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <GuardianVisitApplicationsTab applications={applications} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
