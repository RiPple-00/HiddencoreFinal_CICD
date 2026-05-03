import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";

const PRIMARY = "#0B4EA2";

export default function VisitReservationCompletePage({ data, onHome }) {
  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onHome}>
          <Text style={styles.primaryBtnText}>홈으로 이동</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onHome} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>방문 예약 신청</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successIconWrap}>
          <Text style={styles.successIconInner}>✓</Text>
        </View>
        <Text style={styles.mainTitle}>면회 신청이 완료되었습니다</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeDot}>●</Text>
          <Text style={styles.badgeText}>승인 대기</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>예약 상세 내역</Text>

          <View style={styles.cardBlock}>
            <Text style={styles.cardLabel}>VISIT DATE</Text>
            <Text style={styles.cardValue}>{data.visitDateDetail}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBlock}>
            <Text style={styles.cardLabel}>PATIENT NAME</Text>
            <Text style={styles.cardValue}>{data.patientLine}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBlock}>
            <Text style={styles.cardLabel}>VISIT TYPE</Text>
            <Text style={styles.cardValue}>{data.visitTypeDetail}</Text>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>ⓘ 유의사항</Text>
          <Text style={styles.noticeBullet}>
            • 승인 결과는 카카오톡 알림톡 또는 '예약 내역'에서 확인 가능합니다.
          </Text>
          <Text style={styles.noticeBullet}>
            • 면회 시간 10분 전까지 원무과 데스크에 방문하여 접수해 주세요.
          </Text>
          <Text style={styles.noticeBullet}>
            • 발열이나 호흡기 증상이 있을 경우 면회가 제한될 수 있습니다.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onHome}>
          <Text style={styles.primaryBtnText}>홈으로 이동</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F6F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  back: { fontSize: 22, color: PRIMARY, width: 40 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: PRIMARY },
  headerSpacer: { width: 40 },
  scroll: { padding: 20, paddingBottom: 40 },
  successIconWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    color: "#fff",
    textAlign: "center",
    lineHeight: 44,
    fontSize: 24,
    fontWeight: "800",
    overflow: "hidden",
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  badge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    gap: 6,
  },
  badgeDot: { fontSize: 8, color: PRIMARY },
  badgeText: { fontSize: 13, fontWeight: "700", color: PRIMARY },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  cardBlock: { marginBottom: 4 },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  noticeBox: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  noticeTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 10 },
  noticeBullet: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
