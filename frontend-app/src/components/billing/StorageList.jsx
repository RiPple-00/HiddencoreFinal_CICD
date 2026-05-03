/**
 * 청구서 목록 화면
 * ─────────────────────────────────────────────
 * 진입: StoragePage → "청구서 내역 보기"
 *
 * 라우트 파라미터:
 *   - category : 카테고리 필터 (선택)
 *
 * 호출 API:
 *   - storageApi.getPatients({ id })
 *   - storageApi.getInvoices(params)  : 필터 변경 시마다
 *
 * 표시: 환자 바, 년/월 캘린더 피커, 상태 드롭다운, 청구서 카드 목록
 * 카드 클릭 → InvoicePaymentList
 */

import { useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import storageApi from "../../api/storageApi";
import { normalizeInvoice, normalizePatient, formatWon } from "../../utils/Storageformat";
import { styles } from "../../styles/storageList.styles";
import { COLORS } from "../../styles/colors";

const STATUS_OPTIONS = ["전체", "완납", "부분납", "미납"];
const PATIENT_ID = 1; // TODO: 인증/세션에서

const STATUS_BADGE_COLOR = {
  완납:   { bg: COLORS.green50,  border: COLORS.green200,  text: COLORS.green700 },
  부분납: { bg: COLORS.orange50, border: COLORS.orange200, text: COLORS.orange700 },
  미납:   { bg: COLORS.red50,    border: COLORS.red200,    text: COLORS.red600 },
};

function StatusBadge({ status }) {
  const color = STATUS_BADGE_COLOR[status] ?? { bg: "#f3f4f6", border: COLORS.borderNormal, text: COLORS.textMuted };
  return (
    <View style={[styles.statusBadge, { backgroundColor: color.bg, borderColor: color.border }]}>
      <Text style={[styles.statusBadgeText, { color: color.text }]}>{status}</Text>
    </View>
  );
}

export default function StorageList({ route, navigation }) {
  const category  = route.params?.category || "all";
  const pageTitle = category === "all" ? "청구서 목록" : `${category} 청구서`;

  // null = 전체 기간, { year, month } = 특정 월
  const [selectedYearMonth, setSelectedYearMonth] = useState(null);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [patient, setPatient]   = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const dateLabel = selectedYearMonth
    ? `${selectedYearMonth.year}년 ${selectedYearMonth.month}월`
    : "전체 기간";

  // 환자 정보 (mount 1회)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storageApi.getPatients({ id: PATIENT_ID });
        if (cancelled) return;
        const data = res.data?.data ?? res.data ?? [];
        setPatient(
          Array.isArray(data) ? normalizePatient(data[0] ?? {}) : normalizePatient(data)
        );
      } catch {/* 환자 실패는 무시 */}
    })();
    return () => { cancelled = true; };
  }, []);

  // 청구서 (필터 변경 시마다)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { patientId: PATIENT_ID };
        if (category !== "all")        params.category = category;
        if (selectedStatus !== "전체") params.status   = selectedStatus;
        if (selectedYearMonth) {
          params.year  = selectedYearMonth.year;
          params.month = selectedYearMonth.month;
        }
        const res  = await storageApi.getInvoices(params);
        const data = res.data?.data ?? res.data ?? [];
        if (cancelled) return;
        setInvoices((Array.isArray(data) ? data : []).map(normalizeInvoice));
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "청구서를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category, selectedStatus, selectedYearMonth]);

  // 클라이언트 추가 필터링 (백엔드 필터 부족 대비)
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const categoryMatch = category === "all" || inv.tags.includes(category);
      const statusMatch   = selectedStatus === "전체" || inv.status === selectedStatus;
      let dateMatch = true;
      if (selectedYearMonth) {
        const [y, m] = inv.month.split(".");
        dateMatch =
          parseInt(y, 10) === selectedYearMonth.year &&
          parseInt(m, 10) === selectedYearMonth.month;
      }
      return categoryMatch && statusMatch && dateMatch;
    });
  }, [invoices, category, selectedStatus, selectedYearMonth]);

  const invoiceMonthsSet = useMemo(
    () => new Set(invoices.map((inv) => inv.month)),
    [invoices]
  );

  const totalAmount = useMemo(() => {
    const sum = filtered.reduce((acc, inv) => acc + (inv.amountNumber ?? 0), 0);
    return formatWon(sum);
  }, [filtered]);

  const toggleDropdown = (name) => {
    if (name === "date" && openDropdown !== "date") {
      setPickerYear(selectedYearMonth?.year ?? new Date().getFullYear());
    }
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const selectMonth = (year, month) => {
    setSelectedYearMonth({ year, month });
    setOpenDropdown(null);
  };

  const clearDateFilter = () => {
    setSelectedYearMonth(null);
    setOpenDropdown(null);
  };

  const isDateActive   = openDropdown === "date" || selectedYearMonth;
  const isStatusActive = openDropdown === "status" || selectedStatus !== "전체";

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pageTitle}</Text>
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
        {/* 날짜(년/월) 피커 */}
        <View>
          <TouchableOpacity
            onPress={() => toggleDropdown("date")}
            style={[styles.filterButton, isDateActive && styles.filterButtonActive]}
          >
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={[styles.filterButtonText, isDateActive && styles.filterButtonTextActive]}>
              {dateLabel} ▾
            </Text>
          </TouchableOpacity>

          {openDropdown === "date" && (
            <View style={styles.pickerBox}>
              {/* 년도 네비게이션 */}
              <View style={styles.yearNav}>
                <TouchableOpacity onPress={() => setPickerYear((y) => y - 1)} style={styles.yearNavButton}>
                  <Text style={styles.yearNavArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.yearLabel}>{pickerYear}년</Text>
                <TouchableOpacity onPress={() => setPickerYear((y) => y + 1)} style={styles.yearNavButton}>
                  <Text style={styles.yearNavArrow}>›</Text>
                </TouchableOpacity>
              </View>

              {/* 월 그리드 */}
              <View style={styles.monthGrid}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const isSelected =
                    selectedYearMonth?.year === pickerYear &&
                    selectedYearMonth?.month === m;
                  const key = `${pickerYear}.${String(m).padStart(2, "0")}`;
                  const hasInvoice = invoiceMonthsSet.has(key);

                  return (
                    <View key={m} style={styles.monthCell}>
                      <Pressable
                        onPress={() => selectMonth(pickerYear, m)}
                        style={[styles.monthButton, isSelected && styles.monthButtonSelected]}
                      >
                        <Text style={[
                          styles.monthText,
                          isSelected ? styles.monthTextSelected : (hasInvoice ? styles.monthTextHasInvoice : styles.monthTextEmpty),
                        ]}>
                          {m}월
                        </Text>
                        {hasInvoice && !isSelected && <View style={styles.monthDot} />}
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              {/* 전체 기간 */}
              <Pressable
                onPress={clearDateFilter}
                style={[styles.clearButton, !selectedYearMonth && styles.clearButtonActive]}
              >
                <Text style={styles.clearButtonText}>전체 기간 보기</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 상태 드롭다운 */}
        <View>
          <TouchableOpacity
            onPress={() => toggleDropdown("status")}
            style={[styles.filterButton, isStatusActive && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, isStatusActive && styles.filterButtonTextActive]}>
              {selectedStatus === "전체" ? "전체 상태" : selectedStatus} ▾
            </Text>
          </TouchableOpacity>
          {openDropdown === "status" && (
            <View style={styles.dropdownBox}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { setSelectedStatus(opt); setOpenDropdown(null); }}
                  style={[styles.dropdownItem, selectedStatus === opt && styles.dropdownItemActive]}
                >
                  <Text style={[styles.dropdownItemText, selectedStatus === opt && styles.dropdownItemTextActive]}>
                    {opt === "전체" ? "전체 상태" : opt}
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
          총 청구금액 <Text style={styles.summaryAmountBold}>{totalAmount}</Text>
        </Text>
      </View>

      {/* 청구서 목록 */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {error ? (
          <View style={styles.emptyBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color={COLORS.blue400} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>해당하는 청구서가 없습니다.</Text>
            {selectedYearMonth && (
              <TouchableOpacity onPress={clearDateFilter}>
                <Text style={styles.emptyAction}>전체 기간 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((inv) => (
            <TouchableOpacity
              key={inv.id}
              style={styles.invoiceCard}
              onPress={() => navigation.navigate("InvoicePaymentList", { invoice: inv })}
            >
              <Text style={styles.invoiceMonth}>{inv.month}</Text>
              <View style={styles.invoiceTitleRow}>
                <Text style={styles.invoiceTitle}>{inv.title}</Text>
                <StatusBadge status={inv.status} />
              </View>
              <View style={styles.invoiceDateRow}>
                <Text style={styles.invoiceDate}>발행일 {inv.issued}</Text>
                <Text style={styles.invoiceDate}>
                  납부기한 <Text style={inv.status === "미납" ? styles.invoiceDateRed : null}>{inv.due}</Text>
                </Text>
              </View>
              <View style={styles.tagRow}>
                {inv.tags.map((tag) => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.invoiceAmount}>{inv.amount}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


