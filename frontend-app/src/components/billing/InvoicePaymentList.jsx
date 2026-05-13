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
  View, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import Text from "../Text";
import storageApi from "../../api/storageApi";
import { normalizePayment, formatWonSymbol } from "../../utils/Storageformat";
import { TAG_COLORS, STATUS_COLORS } from "../../styles/colors";

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
  const now   = new Date();
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
  const [payments,         setPayments]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);

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
    payments.filter((p) => selectedCategory === "전체" || p.tag === selectedCategory),
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
    <SafeAreaView className="flex-1 bg-guardian-bg-primary">

      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background-neutral border-b border-guardian-button-secondary">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <Text className="text-3xl text-guardian-text-primary">‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-guardian-text-primary">결제 내역</Text>
        <View className="w-10" />
      </View>

      <ScrollView>
        {/* 최근 30일 총 결제금액 */}
        <View className="bg-background-neutral mx-4 mt-4 rounded-2xl p-4 mb-3">
          <Text className="text-sm text-guardian-text-neutral mb-1">
            총 결제 금액 (최근 30일)
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color="#FCC101" />
          ) : (
            <Text className="text-2xl font-extrabold text-guardian-text-primary">
              {thisMonthTotal}
            </Text>
          )}
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

        {/* 목록 */}
        <View className="px-4 pb-10">
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
                  const tagColor    = TAG_COLORS[pay.tag]    ?? { bg: "#FEF7E5", text: "#503115" };
                  const statusColor = STATUS_COLORS[pay.status] ?? STATUS_COLORS.미납;
                  const isMiNap     = pay.status === "미납";
                  return (
                    <TouchableOpacity
                      key={pay.id}
                      className="bg-background-neutral rounded-2xl p-4 mb-3 border border-guardian-button-secondary"
                      onPress={() => navigation.navigate("StorageDetail", { payment: pay })}
                    >
                      {/* 상태 뱃지 + 날짜 */}
                      <View className="flex-row justify-between items-center mb-2">
                        <View style={{ backgroundColor: statusColor.bg }} className="px-2 py-[3px] rounded-full">
                          <Text style={{ color: statusColor.text }} className="text-[11px] font-bold">
                            {pay.status}
                          </Text>
                        </View>
                        <Text className="text-xs text-guardian-text-neutral">
                          {pay.date} {pay.time}
                        </Text>
                      </View>

                      {/* 결제 금액 */}
                      <Text className="text-xs text-guardian-text-neutral mb-1">결제 금액</Text>
                      <Text className={`text-xl font-extrabold mb-3 ${
                        isMiNap ? "text-error-primary" : "text-guardian-text-primary"
                      }`}>
                        {pay.amount}
                      </Text>

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}