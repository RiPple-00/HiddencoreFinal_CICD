/**
 * 결제 내역 화면 (리스트형 - 환자 정보 포함)
 * ─────────────────────────────────────────────
 * 진입: StoragePage → "최근 결제 내역 보기"
 *
 * 호출 API:
 *   - storageApi.getPatients({ id })
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
import { normalizePayment, normalizePatient, formatWon } from "../../utils/Storageformat";
import { styles } from "../../styles/payMent.styles.js";
import { TAG_COLORS, COLORS } from "../../styles/colors";

const CATEGORY_OPTIONS = ["전체", "진료비", "식대", "입원비", "약제비"];
const DATE_OPTIONS     = ["전체 기간", "최근 1개월", "최근 3개월", "최근 6개월"];
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
  const months = { "최근 1개월": 1, "최근 3개월": 3, "최근 6개월": 6 }[opt];
  if (!months) return null;
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  return { from: from.toISOString().slice(0, 10), to: today };
}

export default function PaymentHistory({ navigation }) {
  const formatDateLabel = useMemo(makeFormatDateLabel, []);

  const [selectedDate,     setSelectedDate]     = useState("전체 기간");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [openDropdown,     setOpenDropdown]     = useState(null);

  const [patient,  setPatient]  = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // 환자 (mount 1회)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res  = await storageApi.getPatients({ id: PATIENT_ID });
        if (cancelled) return;
        const data = res.data?.data ?? res.data ?? [];
        setPatient(
          Array.isArray(data) ? normalizePatient(data[0] ?? {}) : normalizePatient(data)
        );
      } catch {/* 환자 실패는 무시 */}
    })();
    return () => { cancelled = true; };
  }, []);

  // 결제 내역 (필터 변경 시마다)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { patientId: PATIENT_ID, status: "완료" };
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

  const totalAmount = useMemo(() => {
    const sum = filtered.reduce((acc, p) => acc + (p.amountNumber ?? 0), 0);
    return formatWon(sum);
  }, [filtered]);

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

      {/* 환자 요약 바 */}
      <View style={styles.patientBar}>
        <View style={styles.patientAvatar}>
          <Text style={styles.patientAvatarText}>{patient?.name?.[0] ?? "?"}</Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient?.name ?? "-"}</Text>
          {patient?.status && <Text style={styles.patientStatus}>({patient.status})</Text>}
          <Text style={styles.patientMeta}>
            {patient?.room ? `${patient.room}호` : ""}
            {patient?.admissionDate ? ` · 입원일 ${patient.admissionDate}` : ""}
          </Text>
        </View>
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

      {/* 요약 행 */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryCount}>총 {filtered.length}건</Text>
        <Text style={styles.summaryAmount}>
          총 결제금액 <Text style={styles.summaryAmountBold}>{totalAmount}</Text>
        </Text>
      </View>

      {/* 목록 */}
      <ScrollView contentContainerStyle={styles.listContent}>
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
                const tagColor = TAG_COLORS[pay.tag] ?? { bg: "#f3f4f6", text: COLORS.textMuted };
                return (
                  <TouchableOpacity
                    key={pay.id}
                    style={styles.smallCard}
                    onPress={() => navigation.navigate("StorageDetail", { invoiceId: pay.invoiceId, payment: pay })}
                  >
                    <View style={styles.smallCardTopRow}>
                      <Text style={styles.smallCardTitle}>{pay.title}</Text>
                      <Text style={styles.smallCardAmount}>{pay.amountWon}</Text>
                    </View>
                    <View style={styles.smallCardBottomRow}>
                      <Text style={styles.smallCardTime}>{pay.time}</Text>
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>{pay.status}</Text>
                      </View>
                    </View>
                    <View style={styles.smallCardTagRow}>
                      <View style={[styles.tagBadgeSmall, { backgroundColor: tagColor.bg }]}>
                        <Text style={[styles.tagBadgeSmallText, { color: tagColor.text }]}>{pay.tag}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
