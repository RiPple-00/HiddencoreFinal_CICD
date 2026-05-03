/**
 * 결제 내역 화면 (큰 카드형)
 * ─────────────────────────────────────────────
 * 진입: StoragePage 미납·부분납 카드 클릭, 또는 "전체보기"
 *
 * 호출 API:
 *   - storageApi.getPaymentHistories(params)
 *
 * 카드 클릭 → StorageDetail
 */

import { useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import storageApi from "../../api/storageApi";
import { normalizePayment, formatWonSymbol } from "../../utils/Storageformat";
import { styles } from "../../styles/payMent.styles.js";
import { TAG_COLORS, STATUS_COLORS, COLORS } from "../../styles/colors";

const CATEGORY_OPTIONS = ["전체", "진료비", "식대", "입원비", "약제비"];
const DATE_OPTIONS     = ["전체 기간", "최근 1개월", "최근 3개월", "최근 6개월", "2023년"];
const PATIENT_ID = 1; // TODO: 인증/세션에서

function groupByDate(payments) {
  const groups = {};
  payments.forEach((p) => {
    if (!groups[p.date]) groups[p.date] = [];
    groups[p.date].push(p);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function makeFormatDateLabel() {
  const fmt = (d) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const now       = new Date();
  const today     = fmt(now);
  const yesterday = fmt(new Date(now.getTime() - 86400000));
  return (dateStr) => {
    if (dateStr === today)     return "오늘";
    if (dateStr === yesterday) return "어제";
    return dateStr;
  };
}

function dateOptionToRange(opt) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (opt === "전체 기간") return null;
  if (opt === "2023년")    return { from: "2023-01-01", to: "2023-12-31" };
  const months = { "최근 1개월": 1, "최근 3개월": 3, "최근 6개월": 6 }[opt];
  if (!months) return null;
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  return { from: from.toISOString().slice(0, 10), to: today };
}

export default function InvoicePaymentList({ navigation }) {
  const formatDateLabel = useMemo(makeFormatDateLabel, []);

  const [selectedDate,     setSelectedDate]     = useState("전체 기간");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [openDropdown,     setOpenDropdown]     = useState(null);

  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { patientId: PATIENT_ID };
        if (selectedCategory !== "전체") params.category = selectedCategory;
        const range = dateOptionToRange(selectedDate);
        if (range) { params.from = range.from; params.to = range.to; }
        const res  = await storageApi.getPaymentHistories(params);
        const data = res.data?.data ?? res.data ?? [];
        if (cancelled) return;
        setPayments((Array.isArray(data) ? data : []).map(normalizePayment));
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "결제 내역을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedCategory, selectedDate]);

  const filtered = useMemo(() =>
    payments.filter((p) =>
      selectedCategory === "전체" || p.tag === selectedCategory
    ),
  [payments, selectedCategory]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // 최근 30일 합계 (미납 제외)
  const thisMonthTotal = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const sum = payments
      .filter((p) => {
        if (p.status === "미납") return false;
        const d = new Date(p.date.replace(/\./g, "-"));
        return d >= cutoff;
      })
      .reduce((acc, p) => acc + (p.amountNumber ?? 0), 0);
    return formatWonSymbol(sum);
  }, [payments]);

  const toggleDropdown = (name) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const isDateActive     = openDropdown === "date";
  const isCategoryActive = openDropdown === "category";

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제 내역</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView>
        {/* 최근 30일 총 결제금액 */}
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderLabel}>총 결제 금액 (최근 30일)</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.blue400} />
          ) : (
            <Text style={styles.summaryHeaderAmount}>{thisMonthTotal}</Text>
          )}
        </View>

        {/* 필터 바 */}
        <View style={styles.filterBar}>
          <View>
            <TouchableOpacity
              onPress={() => toggleDropdown("date")}
              style={[styles.filterButton, isDateActive && styles.filterButtonActive]}
            >
              <Text style={[styles.filterButtonText, isDateActive && styles.filterButtonTextActive]}>
                {selectedDate} ▾
              </Text>
            </TouchableOpacity>
            {isDateActive && (
              <View style={styles.dropdownBox}>
                {DATE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => { setSelectedDate(opt); setOpenDropdown(null); }}
                    style={[styles.dropdownItem, selectedDate === opt && styles.dropdownItemActive]}
                  >
                    <Text style={[styles.dropdownItemText, selectedDate === opt && styles.dropdownItemTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View>
            <TouchableOpacity
              onPress={() => toggleDropdown("category")}
              style={[styles.filterButton, isCategoryActive && styles.filterButtonActive]}
            >
              <Text style={[styles.filterButtonText, isCategoryActive && styles.filterButtonTextActive]}>
                {selectedCategory === "전체" ? "전체 항목" : selectedCategory} ▾
              </Text>
            </TouchableOpacity>
            {isCategoryActive && (
              <View style={styles.dropdownBox}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => { setSelectedCategory(opt); setOpenDropdown(null); }}
                    style={[styles.dropdownItem, selectedCategory === opt && styles.dropdownItemActive]}
                  >
                    <Text style={[styles.dropdownItemText, selectedCategory === opt && styles.dropdownItemTextActive]}>
                      {opt === "전체" ? "전체 항목" : opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 목록 */}
        <View style={styles.listContent}>
          {error ? (
            <View style={styles.emptyBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : loading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="large" color={COLORS.blue400} />
            </View>
          ) : grouped.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>해당하는 결제 내역이 없습니다.</Text>
            </View>
          ) : (
            grouped.map(([date, dayPayments]) => (
              <View key={date} style={styles.dateGroup}>
                <View style={styles.dateLabelRow}>
                  <Text style={styles.dateLabel}>{formatDateLabel(date)}</Text>
                  <View style={styles.dateLine} />
                </View>
                {dayPayments.map((pay) => {
                  const tagColor    = TAG_COLORS[pay.tag] ?? { bg: "#f3f4f6", text: COLORS.textMuted };
                  const statusColor = STATUS_COLORS[pay.status] ?? { bg: "#f3f4f6", text: COLORS.textMuted, amount: COLORS.textPrimary };
                  const isMiNap = pay.status === "미납";
                  return (
                    <TouchableOpacity
                      key={pay.id}
                      style={styles.bigCard}
                      onPress={() => navigation.navigate("StorageDetail", { payment: pay })}
                    >
                      <View style={styles.bigCardStatusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>{pay.status}</Text>
                        </View>
                        <Text style={styles.bigCardDate}>{pay.date} {pay.time}</Text>
                      </View>
                      <Text style={styles.bigCardLabel}>결제 금액</Text>
                      <Text style={[styles.bigCardAmount, isMiNap && styles.bigCardAmountRed]}>
                        {pay.amount}
                      </Text>
                      <View style={[styles.bigCardTagPill, { backgroundColor: tagColor.bg }]}>
                        <Text style={[styles.bigCardTagText, { color: tagColor.text }]}>{pay.tag}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
