/**
 * 수납 메인 화면
 * 진입: 다른 팀원 홈 화면 하단 탭바 "수납" 클릭
 *
 * 호출 API:
 *   - storageApi.getPatients({ id })
 *   - storageApi.getOverdueHistories({ patientId, limit })
 *
 * 화면 이동 (navigation prop 통해):
 *   - PaymentHistory      : 최근 결제 내역
 *   - StorageList         : 청구서 목록
 *   - InvoicePaymentList  : 미납·부분납 항목 클릭 시
 */

import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import storageApi from "../../api/storageApi";
import { normalizePatient, normalizePayment } from "../../utils/Storageformat";
import { styles } from "../../styles/storagePage.styles";
import { TAG_COLORS, STATUS_COLORS, COLORS } from "../../styles/colors";

// TODO: 인증/세션에서 환자 ID 가져오도록 변경 필요
const PATIENT_ID = 1;

export default function StoragePage({ navigation }) {
  const [patient,     setPatient]     = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [patientsRes, overdueRes] = await Promise.all([
          storageApi.getPatients({ id: PATIENT_ID }),
          storageApi.getOverdueHistories({ patientId: PATIENT_ID, limit: 5 }),
        ]);
        if (cancelled) return;

        const patientsData = patientsRes.data?.data ?? patientsRes.data ?? [];
        const overdueData  = overdueRes.data?.data  ?? overdueRes.data  ?? [];

        const normalizedPatient = Array.isArray(patientsData)
          ? normalizePatient(patientsData[0] ?? {})
          : normalizePatient(patientsData);

        const normalizedOverdue = (Array.isArray(overdueData) ? overdueData : [])
          .map(normalizePayment)
          .slice(0, 5);

        setPatient(normalizedPatient);
        setPendingList(normalizedOverdue);
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>청구 내역</Text>

        {/* 가운데 정렬을 위한 오른쪽 스페이서 */}
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 환자 정보 + 예상 수납 카드 */}
        <View style={styles.topSection}>
          <View style={styles.patientRow}>
            <View style={styles.patientAvatar}>
              <Text style={styles.patientAvatarText}>{patient?.name?.[0] ?? "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.blue400} />
              ) : (
                <>
                  <Text style={styles.patientName}>{patient?.name ?? "-"} 님</Text>
                  <Text style={styles.patientMeta}>
                    {patient?.room ? `${patient.room}호 ` : ""}{patient?.status ?? ""}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.expectedHeader}>
            <Text style={styles.expectedLabel}>예상 수납 금액</Text>
            <Text style={styles.expectedDate}>
              {patient?.expectedTotalAsOf ? `${patient.expectedTotalAsOf} 기준` : ""}
            </Text>
          </View>

          <View style={styles.expectedCard}>
            <Text style={styles.expectedSubLabel}>현재까지 정산된 금액</Text>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.blue400} style={{ marginVertical: 8 }} />
            ) : (
              <Text style={styles.expectedAmount}>
                {(patient?.expectedTotal ?? 0).toLocaleString("ko-KR")}
                <Text style={styles.expectedAmountUnit}> KRW</Text>
              </Text>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("PaymentHistory")}
            >
              <Text style={styles.primaryButtonText}>최근 결제 내역 보기 →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("StorageList")}
            >
              <Text style={styles.secondaryButtonText}>청구서 내역 보기 →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && pendingList.length > 0 && (
          <View style={styles.pendingSection}>
            <View style={styles.pendingHeader}>
              <Text style={styles.pendingTitle}>미납·부분납 항목</Text>
              <TouchableOpacity onPress={() => navigation.navigate("InvoicePaymentList")}>
                <Text style={styles.pendingMore}>전체보기 →</Text>
              </TouchableOpacity>
            </View>

            {pendingList.map((pay) => {
              const tagColor    = TAG_COLORS[pay.tag] ?? { bg: "#f3f4f6", text: COLORS.textMuted };
              const statusColor = STATUS_COLORS[pay.status] ?? STATUS_COLORS.미납;
              return (
                <TouchableOpacity
                  key={pay.id}
                  style={styles.pendingCard}
                  onPress={() => navigation.navigate("InvoicePaymentList", { payment: pay })}
                >
                  <View style={styles.pendingCardLeft}>
                    <View style={styles.pendingBadgeRow}>
                      <View style={[styles.pendingBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.pendingBadgeText, { color: statusColor.text }]}>{pay.status}</Text>
                      </View>
                      <View style={[styles.pendingBadge, { backgroundColor: tagColor.bg }]}>
                        <Text style={[styles.pendingTagText, { color: tagColor.text }]}>{pay.tag}</Text>
                      </View>
                    </View>
                    <Text style={styles.pendingItemTitle} numberOfLines={1}>{pay.title}</Text>
                    <Text style={styles.pendingItemDate}>{pay.date} {pay.time}</Text>
                  </View>
                  <Text style={[styles.pendingAmount, { color: statusColor.amount }]}>
                    {pay.amount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.blue400} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}