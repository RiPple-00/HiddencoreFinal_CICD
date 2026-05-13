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
  View, ScrollView, TouchableOpacity, Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "../Text";
import storageApi from "../../api/storageApi";
import { normalizeInvoice, normalizePatient, formatWon } from "../../utils/Storageformat";

const STATUS_OPTIONS = ["전체", "완납", "부분납", "미납"];
const PATIENT_ID = 1; // TODO: 인증/세션에서

// 상태 뱃지 색상 토큰
const STATUS_STYLE = {
  완납:   { bg: "bg-success-secondary",         border: "border-success-primary",         text: "text-success-primary" },
  부분납: { bg: "bg-guardian-button-secondary",  border: "border-guardian-button-primary",  text: "text-guardian-text-primary" },
  미납:   { bg: "bg-error-secondary",            border: "border-error-primary",            text: "text-error-primary" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? {
    bg: "bg-guardian-bg-secondary", border: "border-guardian-button-secondary", text: "text-guardian-text-neutral",
  };
  return (
    <View className={`px-2 py-[3px] rounded-full border ${s.bg} ${s.border}`}>
      <Text className={`text-[11px] font-bold ${s.text}`}>{status}</Text>
    </View>
  );
}

export default function StorageList({ route, navigation }) {
  const category  = route.params?.category || "all";
  const pageTitle = category === "all" ? "청구서 목록" : `${category} 청구서`;

  // null = 전체 기간, { year, month } = 특정 월
  const [selectedYearMonth, setSelectedYearMonth] = useState(null);
  const [pickerYear,        setPickerYear]        = useState(new Date().getFullYear());
  const [selectedStatus,    setSelectedStatus]    = useState("전체");
  const [openDropdown,      setOpenDropdown]      = useState(null);
  const [patient,           setPatient]           = useState(null);
  const [invoices,          setInvoices]          = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);

  const dateLabel = selectedYearMonth
    ? `${selectedYearMonth.year}년 ${selectedYearMonth.month}월`
    : "전체 기간";

  // 환자 정보 (mount 1회)
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

  const isDateActive   = openDropdown === "date"   || !!selectedYearMonth;
  const isStatusActive = openDropdown === "status" || selectedStatus !== "전체";

  return (
    <SafeAreaView
      className="flex-1 bg-guardian-bg-primary"
      edges={["bottom", "left", "right"]}
    >

      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background-neutral border-b border-guardian-button-secondary">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <Text className="text-3xl text-guardian-text-primary">‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-guardian-text-primary">{pageTitle}</Text>
        <View className="w-10" />
      </View>

      {/* 환자 요약 바 */}
      <View className="flex-row items-center px-4 py-3 bg-background-neutral gap-3 border-b border-guardian-button-secondary">
        <View className="w-10 h-10 rounded-full bg-guardian-button-primary justify-center items-center">
          <Text className="text-base font-bold text-guardian-text-primary">
            {patient?.name?.[0] ?? "?"}
          </Text>
        </View>
        <View>
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-bold text-guardian-text-primary">
              {patient?.name ?? "-"}
            </Text>
            {patient?.status && (
              <Text className="text-xs text-guardian-text-neutral">({patient.status})</Text>
            )}
          </View>
          <Text className="text-xs text-guardian-text-neutral mt-[2px]">
            {patient?.room ? `${patient.room}호` : ""}
            {patient?.admissionDate ? ` · 입원일 ${patient.admissionDate}` : ""}
          </Text>
        </View>
      </View>

      {/* 필터 바 */}
      <View className="flex-row gap-2 px-4 py-3">

        {/* 날짜(년/월) 피커 */}
        <View>
          <TouchableOpacity
            onPress={() => toggleDropdown("date")}
            className={`flex-row items-center gap-1 px-3 py-2 rounded-full border ${
              isDateActive
                ? "bg-guardian-button-primary border-guardian-button-primary"
                : "bg-guardian-bg-secondary border-guardian-button-secondary"
            }`}
          >
            <Text>📅</Text>
            <Text className={`text-sm font-bold ${
              isDateActive ? "text-guardian-text-primary" : "text-guardian-text-neutral"
            }`}>
              {dateLabel} ▾
            </Text>
          </TouchableOpacity>

          {openDropdown === "date" && (
            <View className="absolute top-10 left-0 bg-background-neutral rounded-xl border border-guardian-button-secondary z-10 w-64 p-3">

              {/* 년도 네비게이션 */}
              <View className="flex-row items-center justify-between mb-2">
                <TouchableOpacity onPress={() => setPickerYear((y) => y - 1)} className="p-2">
                  <Text className="text-xl text-guardian-text-primary font-bold">‹</Text>
                </TouchableOpacity>
                <Text className="text-base font-bold text-guardian-text-primary">{pickerYear}년</Text>
                <TouchableOpacity onPress={() => setPickerYear((y) => y + 1)} className="p-2">
                  <Text className="text-xl text-guardian-text-primary font-bold">›</Text>
                </TouchableOpacity>
              </View>

              {/* 월 그리드 */}
              <View className="flex-row flex-wrap">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const isSelected =
                    selectedYearMonth?.year === pickerYear &&
                    selectedYearMonth?.month === m;
                  const key        = `${pickerYear}.${String(m).padStart(2, "0")}`;
                  const hasInvoice = invoiceMonthsSet.has(key);
                  return (
                    <View key={m} className="w-1/4 items-center py-1">
                      <Pressable
                        onPress={() => selectMonth(pickerYear, m)}
                        className={`px-2 py-2 rounded-xl items-center ${
                          isSelected ? "bg-guardian-button-primary" : ""
                        }`}
                      >
                        <Text className={`text-sm font-bold ${
                          isSelected    ? "text-guardian-text-primary"
                          : hasInvoice  ? "text-guardian-text-primary"
                          : "text-guardian-text-neutral opacity-40"
                        }`}>
                          {m}월
                        </Text>
                        {/* 청구서 있는 월 표시 도트 */}
                        {hasInvoice && !isSelected && (
                          <View className="w-1 h-1 rounded-full bg-guardian-button-primary mt-1" />
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              {/* 전체 기간 */}
              <Pressable
                onPress={clearDateFilter}
                className={`mt-2 items-center py-2 border-t border-guardian-bg-secondary ${
                  !selectedYearMonth ? "bg-guardian-bg-secondary rounded-lg" : ""
                }`}
              >
                <Text className="text-sm text-guardian-text-neutral font-bold">전체 기간 보기</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 상태 드롭다운 */}
        <View>
          <TouchableOpacity
            onPress={() => toggleDropdown("status")}
            className={`px-3 py-2 rounded-full border ${
              isStatusActive
                ? "bg-guardian-button-primary border-guardian-button-primary"
                : "bg-guardian-bg-secondary border-guardian-button-secondary"
            }`}
          >
            <Text className={`text-sm font-bold ${
              isStatusActive ? "text-guardian-text-primary" : "text-guardian-text-neutral"
            }`}>
              {selectedStatus === "전체" ? "전체 상태" : selectedStatus} ▾
            </Text>
          </TouchableOpacity>
          {openDropdown === "status" && (
            <View className="absolute top-10 left-0 bg-background-neutral rounded-xl border border-guardian-button-secondary z-10 w-32">
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { setSelectedStatus(opt); setOpenDropdown(null); }}
                  className={`px-4 py-3 border-b border-guardian-bg-secondary ${
                    selectedStatus === opt ? "bg-guardian-button-secondary" : ""
                  }`}
                >
                  <Text className={`text-sm ${
                    selectedStatus === opt
                      ? "text-guardian-text-primary font-bold"
                      : "text-guardian-text-neutral"
                  }`}>
                    {opt === "전체" ? "전체 상태" : opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 요약 행 */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-guardian-bg-secondary">
        <Text className="text-sm text-guardian-text-neutral">총 {filtered.length}건</Text>
        <Text className="text-sm text-guardian-text-neutral">
          총 청구금액{" "}
          <Text className="font-bold text-guardian-text-primary">{totalAmount}</Text>
        </Text>
      </View>

      {/* 청구서 목록 */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {error ? (
          <View className="py-10 items-center">
            <Text className="text-error-primary text-sm">{error}</Text>
          </View>
        ) : loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#FCC101" />
          </View>
        ) : filtered.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-guardian-text-neutral text-sm">해당하는 청구서가 없습니다.</Text>
            {selectedYearMonth && (
              <TouchableOpacity onPress={clearDateFilter}>
                <Text className="text-guardian-text-secondary font-bold mt-2">전체 기간 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((inv) => (
            <TouchableOpacity
              key={inv.id}
              className="bg-background-neutral rounded-2xl p-4 mb-3 border border-guardian-button-secondary"
              onPress={() => navigation.navigate("InvoicePaymentList", { invoice: inv })}
            >
              {/* 년/월 */}
              <Text className="text-xs text-guardian-text-neutral mb-1">{inv.month}</Text>

              {/* 제목 + 상태 뱃지 */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-bold text-guardian-text-primary flex-1 mr-2" numberOfLines={1}>
                  {inv.title}
                </Text>
                <StatusBadge status={inv.status} />
              </View>

              {/* 발행일 / 납부기한 */}
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-guardian-text-neutral">발행일 {inv.issued}</Text>
                <Text className="text-xs text-guardian-text-neutral">
                  납부기한{" "}
                  <Text className={inv.status === "미납" ? "text-error-primary font-bold" : ""}>
                    {inv.due}
                  </Text>
                </Text>
              </View>

              {/* 태그 */}
              <View className="flex-row flex-wrap gap-1 mb-2">
                {inv.tags.map((tag) => (
                  <View key={tag} className="bg-guardian-button-secondary px-2 py-[3px] rounded-full">
                    <Text className="text-xs font-bold text-guardian-text-primary">{tag}</Text>
                  </View>
                ))}
              </View>

              {/* 금액 */}
              <Text className="text-lg font-extrabold text-guardian-text-primary text-right">
                {inv.amount}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}