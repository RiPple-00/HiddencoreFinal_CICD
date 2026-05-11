import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const dailyRates = [
  { day: "월", rate: 75 },
  { day: "화", rate: 90 },
  { day: "수", rate: 70 },
  { day: "목", rate: 80 },
  { day: "금", rate: 95 },
  { day: "토", rate: 85 },
  { day: "일", rate: 82 },
];

const checklistData = [
  {
    label: "식사 도움",
    percent: "70%",
    percentStyle: "red",
    dailyComments: [
      "반찬 거부 있음",
      "정상 섭취",
      "반찬 거부 있음",
      "정상 섭취",
      "죽으로 대체",
      "정상 섭취",
      "-",
    ],
  },
  {
    label: "개인 위생 관리",
    percent: "100%",
    percentStyle: "blue",
    dailyComments: ["-", "-", "-", "-", "-", "-", "-"],
  },
  {
    label: "배변 관리",
    percent: "60%",
    percentStyle: "orange",
    dailyComments: [
      "변비 증세 관찰",
      "정상",
      "변비 증세 관찰",
      "변비 증세 관찰",
      "정상",
      "-",
      "-",
    ],
  },
];

export default function ReportPage() {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>정기 보고서</Text>
        </View>

        {/* Patient Card */}
        <View style={styles.card}>
          <View style={styles.patientRow}>
            <View style={styles.profileImage} />

            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>김OO 어르신</Text>

              <View style={styles.dateRow}>
                <Ionicons name="document-text-outline" size={14} color="#64748B" />
                <Text style={styles.dateText}>2024.05.01~</Text>
              </View>

              <Text style={styles.dateText}>2024.05.07</Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>주간 보고서</Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <MaterialCommunityIcons
                name="alert-outline"
                size={28}
                color="#EF4444"
              />
              <Text style={styles.warningText}>주의</Text>
            </View>
          </View>
        </View>

        {/* AI Summary */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ AI 분석 요약</Text>
          </View>

          <Text style={styles.description}>
            이번 주 동안 어르신의 건강 데이터와 기록을 종합 분석한 결과,
            전반적인 상태는 주의가 필요한 수준으로 확인되었습니다.
          </Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridBox}>
              <Text style={styles.gridEmoji}>🍽️</Text>
              <Text style={styles.gridTitle}>식사</Text>
              <Text style={styles.gridDesc}>70% 달성</Text>
            </View>

            <View style={styles.gridBox}>
              <Text style={styles.gridEmoji}>🪥</Text>
              <Text style={styles.gridTitle}>위생</Text>
              <Text style={styles.gridDesc}>완벽 관리</Text>
            </View>

            <View style={styles.gridBox}>
              <Text style={styles.gridEmoji}>🚻</Text>
              <Text style={styles.gridTitle}>배변</Text>
              <Text style={styles.gridDesc}>변비 증상</Text>
            </View>

            <View style={styles.gridBox}>
              <Text style={styles.gridEmoji}>🟩</Text>
              <Text style={styles.gridTitle}>환자 상태</Text>
              <Text style={styles.gridDesc}>안정</Text>
            </View>
          </View>

          <View style={styles.commentBox}>
            <Text style={styles.commentTitle}>💡 AI 분석 코멘트</Text>

            <View style={styles.commentItem}>
              <Text style={styles.commentBullet}>🍽️</Text>
              <Text style={styles.commentText}>
                이번 주 <Text style={styles.commentBold}>반찬 거부가 월·수요일에 반복</Text>
                되었습니다. 부드러운 유동식 위주로 식단을 조정하고, 선호 반찬을 파악해 자발적 섭취를 유도해 주세요.
              </Text>
            </View>

            <View style={styles.commentItem}>
              <Text style={styles.commentBullet}>🚻</Text>
              <Text style={styles.commentText}>
                <Text style={styles.commentBold}>월·수·목 3일간 변비 증세</Text>가 관찰되었습니다.
                수분 섭취량을 늘리고 가벼운 복부 마사지를 권장드립니다. 증세가 지속될 경우 의료진에게 보고해 주세요.
              </Text>
            </View>

            <View style={styles.commentItem}>
              <Text style={styles.commentBullet}>📈</Text>
              <Text style={styles.commentText}>
                금·토요일에는 컨디션이 회복되는 흐름이 확인됩니다.
                <Text style={styles.commentBold}> 위생 관리 루틴은 이번 주 내내 양호</Text>하게 유지되었으니 지속해 주세요.
              </Text>
            </View>
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              1. 요양사 체크리스트 요약
            </Text>
            <Text style={styles.percent}>82%</Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>82%</Text>
            <Text style={styles.progressSub}>수행률</Text>
          </View>

          {/* 일별 수행률 추이 */}
          <View style={styles.dailyRateSection}>
            <Text style={styles.dailyRateTitle}>📊 일별 수행률 추이</Text>
            <View style={styles.dailyRateChart}>
              {dailyRates.map((item) => {
                const barColor =
                  item.rate >= 90
                    ? "#22C55E"
                    : item.rate >= 75
                    ? "#F59E0B"
                    : "#EF4444";
                return (
                  <View key={item.day} style={styles.dailyRateCol}>
                    <Text style={styles.dailyRatePercent}>{item.rate}%</Text>
                    <View style={styles.dailyRateBarBg}>
                      <View
                        style={[
                          styles.dailyRateBarFill,
                          {
                            height: `${item.rate}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.dailyRateDay}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.dailyRateLegend}>
              <Text style={styles.legendItem}>🟢 90% 이상</Text>
              <Text style={styles.legendItem}>🟡 75~89%</Text>
              <Text style={styles.legendItem}>🔴 75% 미만</Text>
            </View>
          </View>

          <View style={styles.table}>
            {checklistData.map((item, index) => {
              const isExpanded = !!expandedRows[index];
              const uniqueComments = [...new Set(item.dailyComments.filter((c) => c !== "-"))];
              const summaryComment =
                uniqueComments.length === 0
                  ? "-"
                  : uniqueComments.length === 1
                  ? uniqueComments[0]
                  : `${uniqueComments[0]} 외 ${uniqueComments.length - 1}건`;
              const percentStyle =
                item.percentStyle === "red"
                  ? styles.redText
                  : item.percentStyle === "blue"
                  ? styles.blueText
                  : styles.orangeText;
              const hasMultiple = uniqueComments.length > 1 || (uniqueComments.length === 1 && item.dailyComments.some((c) => c === "-"));

              return (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.tableRow}
                    onPress={() => toggleRow(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tableLabel}>{item.label}</Text>
                    <Text style={percentStyle}>{item.percent}</Text>
                    <View style={styles.tableEtcRow}>
                      <Text style={styles.tableEtc} numberOfLines={1}>
                        {summaryComment}
                      </Text>
                      {hasMultiple && (
                        <Text style={styles.expandIcon}>
                          {isExpanded ? "▲" : "▼"}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.dailyBox}>
                      {DAYS.map((day, di) => (
                        <View key={di} style={styles.dailyRow}>
                          <Text style={styles.dayLabel}>{day}</Text>
                          <Text
                            style={
                              item.dailyComments[di] === "-"
                                ? styles.dailyCommentNone
                                : styles.dailyComment
                            }
                          >
                            {item.dailyComments[di]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Doctor Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. 의료진 소견 요약</Text>

          <View style={styles.doctorBox}>
            <View style={styles.doctorImage} />

            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>김완치 주치의</Text>
              <Text style={styles.doctorComment}>
                “식단 조정 및 수분 섭취 집중 관리 필요”
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>건강 상태</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>주의 관찰</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주요 소견</Text>
            <Text style={styles.infoValue}>
              소화 기능 저하로 인한 식욕 부진
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>복용 약물</Text>
            <Text style={styles.infoValue}>
              위장 보호제 1종 추가 처방
            </Text>
          </View>
        </View>

        {/* Program Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            3. 프로그램 활동 및 증진 효과
          </Text>

          <View style={styles.programBox}>
            <Text style={styles.programTitle}>실내 가드닝 활동</Text>
            <Text style={styles.programDesc}>
              작은 식물을 심고 물을 주며 소근육 자극 및 심리적 안정감을
              도와주었습니다.
            </Text>
          </View>

          <View style={styles.effectBox}>
            <Text style={styles.effectTitle}>신체 기능 개선</Text>
            <Text style={styles.effectDesc}>
              소근육 조절 능력 및 손가락 민첩성 향상 관찰
            </Text>
          </View>

          <View style={styles.effectBox}>
            <Text style={styles.effectTitle}>정서적 안정</Text>
            <Text style={styles.effectDesc}>
              식물과의 교감을 통해 심리적 평온함 유지 및 사회적 유대감 형성
            </Text>
          </View>

          <View style={styles.aiRecommendBox}>
            <Text style={styles.aiRecommendTitle}>🧠 AI 다음 주 프로그램 추천</Text>

            <View style={styles.aiRecommendItem}>
              <Text style={styles.aiRecommendBullet}>🧘</Text>
              <View style={styles.aiRecommendContent}>
                <Text style={styles.aiRecommendLabel}>신체 기능 강화</Text>
                <Text style={styles.aiRecommendDesc}>소화 기능 저하로 식욕이 감소된 상태입니다. 눈서르게 누워서 하는 스트레칭이나 업다운동작 위주의 활동으로 신체 스트레스를 줄이면 식욕 회복에 도움이 될 수 있습니다.</Text>
              </View>
            </View>

            <View style={styles.aiRecommendItem}>
              <Text style={styles.aiRecommendBullet}>🎨</Text>
              <View style={styles.aiRecommendContent}>
                <Text style={styles.aiRecommendLabel}>인지 자극</Text>
                <Text style={styles.aiRecommendDesc}>간단한 색칠화 또는 백일장 쓰기 활동을 추가하면 인지 자극과 집중력 유지에 효과적입니다.</Text>
              </View>
            </View>

            <View style={[styles.aiRecommendItem, { marginBottom: 0 }]}>
              <Text style={styles.aiRecommendBullet}>🍺</Text>
              <View style={styles.aiRecommendContent}>
                <Text style={styles.aiRecommendLabel}>소화 지원</Text>
                <Text style={styles.aiRecommendDesc}>변비 증세가 반복되고 있어 한방 보다는 가벼운 복부 마사지, 수분 보칮력 활동 등을 프로그램에 포함하면 좋겠습니다.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  patientRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#D9E4F5",
  },

  patientInfo: {
    flex: 1,
    marginLeft: 14,
  },

  patientName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  dateText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  badge: {
    marginTop: 10,
    backgroundColor: "#EEF2FF",
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
  },

  warningBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
  },

  warningText: {
    marginTop: 6,
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  moreText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 18,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridBox: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  gridEmoji: {
    fontSize: 22,
  },

  gridTitle: {
    marginTop: 8,
    fontWeight: "700",
    color: "#1E293B",
  },

  gridDesc: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  commentBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
  },

  commentTitle: {
    color: "#2563EB",
    fontWeight: "700",
    marginBottom: 10,
  },

  commentItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  commentBullet: {
    fontSize: 14,
    marginTop: 1,
  },

  commentText: {
    flex: 1,
    color: "#334155",
    lineHeight: 20,
    fontSize: 13,
  },

  commentBold: {
    fontWeight: "700",
    color: "#1E293B",
  },

  percent: {
    color: "#2563EB",
    fontSize: 24,
    fontWeight: "800",
  },

  dailyRateSection: {
    marginBottom: 16,
  },

  dailyRateTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },

  dailyRateChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 0,
  },

  dailyRateCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },

  dailyRatePercent: {
    fontSize: 9,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "600",
  },

  dailyRateBarBg: {
    width: 16,
    height: 60,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  dailyRateBarFill: {
    width: "100%",
    borderRadius: 8,
  },

  dailyRateDay: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  dailyRateLegend: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  legendItem: {
    fontSize: 11,
    color: "#64748B",
  },

  dailyRateSection: {
    marginBottom: 16,
  },

  dailyRateTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },

  dailyRateChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 0,
  },

  dailyRateCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },

  dailyRatePercent: {
    fontSize: 9,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "600",
  },

  dailyRateBarBg: {
    width: 16,
    height: 60,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  dailyRateBarFill: {
    width: "100%",
    borderRadius: 8,
  },

  dailyRateDay: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  dailyRateLegend: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  legendItem: {
    fontSize: 11,
    color: "#64748B",
  },

  progressCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 20,
  },

  progressText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },

  progressSub: {
    color: "#64748B",
  },

  table: {
    marginTop: 10,
  },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  tableLabel: {
    flex: 1,
    color: "#1E293B",
  },

  tableEtcRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
  },

  tableEtc: {
    textAlign: "right",
    color: "#64748B",
    fontSize: 12,
    flexShrink: 1,
  },

  expandIcon: {
    fontSize: 10,
    color: "#94A3B8",
  },

  dailyBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
    gap: 6,
  },

  dailyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dayLabel: {
    width: 20,
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  dailyComment: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },

  dailyCommentNone: {
    fontSize: 13,
    color: "#CBD5E1",
    flex: 1,
  },

  redText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  blueText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  orangeText: {
    color: "#EA580C",
    fontWeight: "700",
  },

  doctorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 18,
  },

  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D6E4F0",
    marginRight: 14,
  },

  doctorName: {
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 4,
  },

  doctorComment: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 22,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    alignItems: "center",
  },

  infoLabel: {
    color: "#64748B",
    fontWeight: "600",
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    color: "#1E293B",
    marginLeft: 20,
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    color: "#D97706",
    fontWeight: "700",
    fontSize: 12,
  },

  programBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },

  programTitle: {
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },

  programDesc: {
    color: "#475569",
    lineHeight: 20,
  },

  effectBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },

  effectTitle: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#1E293B",
  },

  effectDesc: {
    color: "#64748B",
    lineHeight: 20,
  },

  aiRecommendBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
  },

  aiRecommendTitle: {
    color: "#16A34A",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 12,
  },

  aiRecommendItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  aiRecommendBullet: {
    fontSize: 18,
    marginTop: 1,
  },

  aiRecommendContent: {
    flex: 1,
  },

  aiRecommendLabel: {
    fontWeight: "700",
    color: "#1E293B",
    fontSize: 13,
    marginBottom: 3,
  },

  aiRecommendDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
});