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
  View, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import Text from "../Text";
import storageApi from "../../api/storageApi";
import { normalizePayment, normalizePatient, formatWon } from "../../utils/Storageformat";
import { TAG_COLORS } from "../../styles/colors";

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
  const now   = new Date();
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
  const [patient,          setPatient]          = useState(null);
  const [payments,         setPayments]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);

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
    payments.filter((p) => selectedCategory === "전체" || p.tag === selectedCategory),
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
    <SafeAreaView className="flex-1 bg-guardian-bg-primary">

      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background-neutral border-b border-guardian-button-secondary">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <Text className="text-3xl text-guardian-text-primary">‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-guardian-text-primary">결제 내역</Text>
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
              <Text className="text-xs text-guardian-text-neutral">
                ({patient.status})
              </Text>
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

        {/* 기간 필터 */}
        <View>
          <TouchableOpacity
            onPress={() => toggleDropdown("date")}
            className={`px-3 py-2 rounded-full border ${
              isDateActive
                ? "bg-guardian-button-primary border-guardian-button-primary"
                : "bg-guardian-bg-secondary border-guardian-button-secondary"
            }`}
          >
            <Text className={`text-sm font-bold ${
              isDateActive ? "text-guardian-text-primary" : "text-guardian-text-neutral"
            }`}>
              {selectedDate} ▾
            </Text>
          </TouchableOpacity>
          {isDateActive && (
            <View className="absolute top-10 left-0 bg-background-neutral rounded-xl border border-guardian-button-secondary z-10 w-36">
              {DATE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { setSelectedDate(opt); setOpenDropdown(null); }}
                  className={`px-4 py-3 border-b border-guardian-bg-secondary ${
                    selectedDate === opt ? "bg-guardian-button-secondary" : ""
                  }`}
                >
                  <Text className={`text-sm ${
                    selectedDate === opt
                      ? "text-guardian-text-primary font-bold"
                      : "text-guardian-text-neutral"
                  }`}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 카테고리 필터 */}
        <View>
          <TouchableOpacity
            onPress={() => toggleDropdown("category")}
            className={`px-3 py-2 rounded-full border ${
              isCategoryActive
                ? "bg-guardian-button-primary border-guardian-button-primary"
                : "bg-guardian-bg-secondary border-guardian-button-secondary"
            }`}
          >
            <Text className={`text-sm font-bold ${
              isCategoryActive ? "text-guardian-text-primary" : "text-guardian-text-neutral"
            }`}>
              {selectedCategory === "전체" ? "전체 항목" : selectedCategory} ▾
            </Text>
          </TouchableOpacity>
          {isCategoryActive && (
            <View className="absolute top-10 left-0 bg-background-neutral rounded-xl border border-guardian-button-secondary z-10 w-32">
              {CATEGORY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { setSelectedCategory(opt); setOpenDropdown(null); }}
                  className={`px-4 py-3 border-b border-guardian-bg-secondary ${
                    selectedCategory === opt ? "bg-guardian-button-secondary" : ""
                  }`}
                >
                  <Text className={`text-sm ${
                    selectedCategory === opt
                      ? "text-guardian-text-primary font-bold"
                      : "text-guardian-text-neutral"
                  }`}>
                    {opt === "전체" ? "전체 항목" : opt}
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
          총 결제금액{" "}
          <Text className="font-bold text-guardian-text-primary">{totalAmount}</Text>
        </Text>
      </View>

      {/* 목록 */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {error ? (
          <View className="py-10 items-center">
            <Text className="text-error-primary text-sm">{error}</Text>
          </View>
        ) : loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#FCC101" />
          </View>
        ) : grouped.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-guardian-text-neutral text-sm">
              해당하는 결제 내역이 없습니다.
            </Text>
          </View>
        ) : (
          grouped.map(([date, dayPayments]) => (
            <View key={date} className="mb-4">

              {/* 날짜 레이블 */}
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm font-bold text-guardian-text-primary">
                  {formatDateLabel(date)}
                </Text>
                <View className="flex-1 h-[0.5px] bg-guardian-button-secondary" />
              </View>

              {dayPayments.map((pay) => {
                const tagColor = TAG_COLORS[pay.tag] ?? { bg: "#FEF7E5", text: "#503115" };
                return (
                  <TouchableOpacity
                    key={pay.id}
                    className="bg-background-neutral rounded-2xl p-4 mb-3 border border-guardian-button-secondary"
                    onPress={() => navigation.navigate("StorageDetail", { invoiceId: pay.invoiceId, payment: pay })}
                  >
                    {/* 제목 + 금액 */}
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm font-bold text-guardian-text-primary flex-1 mr-2" numberOfLines={1}>
                        {pay.title}
                      </Text>
                      <Text className="text-sm font-bold text-guardian-text-primary">
                        {pay.amountWon}
                      </Text>
                    </View>

                    {/* 시간 + 완료 뱃지 */}
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs text-guardian-text-neutral">{pay.time}</Text>
                      <View className="bg-success-secondary px-2 py-[3px] rounded-full">
                        <Text className="text-xs font-bold text-success-primary">{pay.status}</Text>
                      </View>
                    </View>

                    {/* 태그 */}
                    <View style={{ backgroundColor: tagColor.bg }} className="self-start px-2 py-[3px] rounded-full">
                      <Text style={{ color: tagColor.text }} className="text-[11px] font-bold">
                        {pay.tag}
                      </Text>
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