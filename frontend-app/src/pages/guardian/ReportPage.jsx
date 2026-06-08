import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  fetchGuardianLinkedPatients,
  fetchGuardianWeeklyReport,
} from "../../api/careChecklistApi";
import {
  resolveGuardianPatientDisplayName,
  resolveGuardianPrimaryPatientId,
} from "../../utils/guardianPatientId";
 
const FALLBACK_DAILY_RATES = [
  { day: "월", rate: 0 },
  { day: "화", rate: 0 },
  { day: "수", rate: 0 },
  { day: "목", rate: 0 },
  { day: "금", rate: 0 },
  { day: "토", rate: 0 },
  { day: "일", rate: 0 },
];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const FALLBACK_CHECKLIST_ROWS = [
  { label: "식사 도움", percent: 0, percentStyle: "warn", dailyComments: ["-", "-", "-", "-", "-", "-", "-"] },
  { label: "개인 위생 관리", percent: 0, percentStyle: "warn", dailyComments: ["-", "-", "-", "-", "-", "-", "-"] },
  { label: "상태 안정화", percent: 0, percentStyle: "warn", dailyComments: ["-", "-", "-", "-", "-", "-", "-"] },
  { label: "배변 관리", percent: 0, percentStyle: "warn", dailyComments: ["-", "-", "-", "-", "-", "-", "-"] },
];

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateToStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base, delta) {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d; 
  
}

function prettyDate(v) {
  if (!v) return "-";
  const s = String(v);
  return s.replace(/-/g, ".");
}

function parseDateLike(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function dayLabelFromDate(value) {
  const d = parseDateLike(value);
  if (!d) return null;
  return DAY_LABELS[d.getDay()];
}

function startOfWeekMonday(dateValue) {
  const d = new Date(dateValue);
  const day = d.getDay();
  const deltaToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + deltaToMonday);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 아직 끝나지 않은 주(진행 중·미래)는 보고서 조회 불가 — 가장 최근 완료 주 월요일 */
function latestReportableWeekMonday(dateValue) {
  const today = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
  const thisMonday = startOfWeekMonday(today);
  return addDays(thisMonday, -7);
}

function keepPleaseTogether(text) {
  return String(text ?? "").replace(/주세요/g, "주\u2060세\u2060요");
}

function formatEffectTwoLines(text, maxLineLen = 24) {
  const raw = String(text ?? "").trim();
  if (!raw) return "";
  if (raw.length <= maxLineLen) return raw;

  const words = raw.split(/\s+/);
  const lines = ["", ""];
  let lineIndex = 0;

  for (const word of words) {
    const candidate = lines[lineIndex] ? `${lines[lineIndex]} ${word}` : word;
    if (candidate.length <= maxLineLen || lineIndex === 1) {
      lines[lineIndex] = candidate;
      continue;
    }
    lineIndex = 1;
    lines[lineIndex] = word;
  }

  if (lines[1].length > maxLineLen) {
    lines[1] = `${lines[1].slice(0, Math.max(0, maxLineLen - 1)).trimEnd()}…`;
  }

  return lines[1] ? `${lines[0]}\n${lines[1]}` : lines[0];
}

export default function ReportPage({ navigation }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [sectionOpen, setSectionOpen] = useState({
    checklist: false,
    program: false,
    prescription: false,
  });
  const [patientId, setPatientId] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestReportRequestIdRef = useRef(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const toggleRow = (index) =>
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  const toggleSection = (key) =>
    setSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const latestWeekStart = useMemo(() => latestReportableWeekMonday(new Date()), []);

  const selectedStartDate = useMemo(
    () => addDays(latestWeekStart, weekOffset * 7),
    [latestWeekStart, weekOffset]
  );

  const selectedEndDate = useMemo(
    () => addDays(selectedStartDate, 6),
    [selectedStartDate]
  );

  const weekStartStr = useMemo(() => dateToStr(selectedStartDate), [selectedStartDate]);
  const weekEndStr = useMemo(() => dateToStr(selectedEndDate), [selectedEndDate]);

  const canGoNextWeek = useMemo(() => weekOffset < 0, [weekOffset]);

  useEffect(() => {
    if (weekOffset > 0) {
      setWeekOffset(0);
    }
  }, [weekOffset]);

  const goPrevWeek = () => setWeekOffset((prev) => prev - 1);
  const goNextWeek = () => {
    if (!canGoNextWeek) return;
    setWeekOffset((prev) => Math.min(prev + 1, 0));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchGuardianLinkedPatients();
        if (cancelled) return;
        const linked = res.data ?? [];
        const pid = resolveGuardianPrimaryPatientId(linked);
        if (!pid) {
          setError("연결된 환자가 없습니다.");
          setLoading(false);
          return;
        }
        setPatientId(pid);
      } catch {
        if (!cancelled) {
          setError("환자 정보를 불러오지 못했습니다.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshWeeklyReport = useCallback(async () => {
    if (patientId == null) return;

    const requestId = latestReportRequestIdRef.current + 1;
    latestReportRequestIdRef.current = requestId;

    try {
      setLoading(true);
      setError(null);
      setReport(null);
      const res = await fetchGuardianWeeklyReport(patientId, weekStartStr, weekEndStr);
      if (requestId !== latestReportRequestIdRef.current) return;
      setReport(res.data ?? null);
    } catch {
      if (requestId !== latestReportRequestIdRef.current) return;
      setError("주간 보고서를 불러오지 못했습니다.");
    } finally {
      if (requestId === latestReportRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [patientId, weekStartStr, weekEndStr]);

  useEffect(() => {
    if (patientId == null) return;
    refreshWeeklyReport();
  }, [patientId, refreshWeeklyReport]);

  // LLM 보고서는 생성 비용·시간이 크므로 3초 폴링 대신 주간 변경 시에만 재조회

  const dailyRates = useMemo(() => {
    if (!report?.dailyRates?.length) return FALLBACK_DAILY_RATES;
    return report.dailyRates.map((d) => ({
      day: dayLabelFromDate(d.date) ?? d.day,
      rate: d.rate ?? 0,
    }));
  }, [report]);

  const weekDayLabels = useMemo(() => {
    const start = parseDateLike(report?.periodStart) ?? selectedStartDate;
    return Array.from({ length: 7 }, (_, i) => dayLabelFromDate(addDays(start, i)) ?? DAYS[i]);
  }, [report?.periodStart, selectedStartDate]);

  const checklistData = useMemo(() => {
    if (!report?.checklistRows?.length) return FALLBACK_CHECKLIST_ROWS;
    return report.checklistRows.map((r) => ({
      label: r.label,
      percent: `${r.percent ?? 0}%`,
      percentStyle: r.percentStyle,
      dailyComments: Array.from(
        { length: 7 },
        (_, i) => (Array.isArray(r.dailyComments) ? r.dailyComments[i] : null) ?? "-"
      ),
    }));
  }, [report]);

  const mealMissingCount = useMemo(() => ({
    morning: report?.mealMissingCount?.morning ?? 0,
    lunch: report?.mealMissingCount?.lunch ?? 0,
    dinner: report?.mealMissingCount?.dinner ?? 0,
    total: report?.mealMissingCount?.total ?? 0,
  }), [report]);

  const overallRate = report?.overallRate ?? 0;
  const riskLevel = overallRate >= 90 ? "안정" : overallRate >= 75 ? "주의" : "위험";
  const riskClass = riskLevel === "위험"
    ? "w-[90px] h-[90px] rounded-2xl border border-error-primary justify-center items-center bg-error-secondary"
    : riskLevel === "주의"
      ? "w-[90px] h-[90px] rounded-2xl border border-guardian-text-secondary justify-center items-center bg-[#FFF7D6]"
      : "w-[90px] h-[90px] rounded-2xl border border-success-primary justify-center items-center bg-success-secondary";
  const riskIconColor = riskLevel === "위험" ? "#ED584C" : riskLevel === "주의" ? "#FCC101" : "#34A853";
  const riskTextClass = riskLevel === "위험" ? "mt-[6px] text-error-primary font-bold text-base"
    : riskLevel === "주의" ? "mt-[6px] text-guardian-text-secondary font-bold text-base"
      : "mt-[6px] text-success-primary font-bold text-base";
  const reportStart = prettyDate(report?.periodStart);
  const reportEnd = prettyDate(report?.periodEnd);
  const aiComments = report?.aiComments?.length ? report.aiComments : ["데이터가 충분하지 않아 기본 안내를 표시합니다."];
  const checklistInsight = report?.checklistInsight ?? "이번 주 체크리스트 관찰 기반으로 요약을 제공합니다.";
  const patientDisplayName = resolveGuardianPatientDisplayName(
    patientId,
    report?.patientName
  );

  const prescriptionSection = report?.prescriptionSection ?? null;

  const programSection = report?.programSection ?? null;
  const categoryRecommendations =
    programSection?.categoryRecommendations?.length
      ? programSection.categoryRecommendations
      : [];
  const diagnosisSection = report?.diagnosisSection ?? null;
  const nextWeekStartLabel = prettyDate(report?.nextWeekStart);

  return (
    <SafeAreaView
      className="flex-1 bg-guardian-bg-secondary"
      edges={["bottom", "left", "right"]}
    >
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="flex-row justify-between items-center mt-[10px] mb-[18px]">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation?.goBack?.()}
              activeOpacity={0.7}
              className="w-[34px] h-[34px] rounded-full items-center justify-center bg-background-neutral mr-[6px]"
            >
              <Ionicons name="chevron-back" size={20} color="#503115" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-guardian-text-primary">정기 보고서</Text>
          </View>
          <View className="w-[34px]" />
        </View>

        <View className="bg-background-neutral rounded-[14px] px-[12px] py-[10px] mb-[12px]">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={goPrevWeek} activeOpacity={0.7}>
              <Text className="text-[13px] font-bold text-guardian-text-primary">이전 주</Text>
            </TouchableOpacity>

            <Text className="text-[13px] font-bold text-guardian-text-neutral">
              {prettyDate(weekStartStr)} ~ {prettyDate(weekEndStr)}
            </Text>

            <TouchableOpacity onPress={goNextWeek} disabled={!canGoNextWeek} activeOpacity={0.7}>
              <Text className={`text-[13px] font-bold ${canGoNextWeek ? "text-guardian-text-primary" : "text-guardian-text-neutral opacity-40"}`}>
                다음 주
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        {loading ? (
          <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px] items-center">
            <ActivityIndicator color="#503115" />
            <Text className="mt-2 text-guardian-text-neutral">주간 보고서 불러오는 중...</Text>
          </View>
        ) : (
          <>
        {error ? (
          <View className="bg-error-secondary rounded-[20px] p-[14px] mb-[18px]">
            <Text className="text-error-primary">{error}</Text>
          </View>
        ) : null}

        {!error ? (
          <>
        {/* 환자 카드 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <View className="flex-row items-center">
            <View className="w-[70px] h-[70px] rounded-full bg-guardian-button-secondary" />

            <View className="flex-1 ml-[14px]">
              <Text className="text-xl font-bold text-guardian-text-primary mb-[6px]">
                {patientDisplayName} 어르신
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="document-text-outline" size={14} color="#503115" />
                <Text className="text-[13px] text-guardian-text-neutral">{reportStart}~</Text>
              </View>
              <Text className="text-[13px] text-guardian-text-neutral mt-[3px]">
                {reportEnd}
              </Text>
              <View className="mt-[10px] bg-guardian-button-secondary self-start rounded-full px-[10px] py-[5px]">
                <Text className="text-xs text-guardian-text-primary font-bold">주간 보고서</Text>
              </View>
            </View>

            <View className={riskClass}>
              <MaterialCommunityIcons name={riskLevel === "안정" ? "shield-check-outline" : "alert-outline"} size={28} color={riskIconColor} />
              <Text className={riskTextClass}>{riskLevel}</Text>
            </View>
          </View>
        </View>

        {/* AI 분석 요약 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-guardian-text-primary">✨ AI 분석 요약</Text>
          </View>

          <Text className="text-[14px] leading-[22px] text-guardian-text-neutral mb-[18px]">
            {report?.summaryText ?? "이번 주 동안 수집된 체크리스트 기반 보고서입니다."}
          </Text>

          <View className="bg-guardian-bg-secondary rounded-[14px] p-[12px] mb-[14px]">
            <Text className="text-[13px] text-guardian-text-primary font-bold mb-[4px]">체크리스트 인사이트</Text>
            <Text className="text-[13px] leading-5 text-guardian-text-neutral">{checklistInsight}</Text>
          </View>

          {diagnosisSection ? (
            <View className="bg-guardian-bg-secondary rounded-[14px] p-[12px] mb-[14px]">
              <Text className="text-[13px] text-guardian-text-primary font-bold mb-[4px]">등록 진단 정보</Text>
              {diagnosisSection.diagnosisTitle ? (
                <Text className="text-[13px] font-semibold text-guardian-text-primary leading-5 mb-[6px]">
                  {diagnosisSection.diagnosisTitle}
                </Text>
              ) : null}
              {diagnosisSection.diagnosisComment ? (
                <Text className="text-[13px] leading-5 text-guardian-text-neutral">
                  {diagnosisSection.diagnosisComment}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View className="flex-row flex-wrap justify-between">
            {[
              { emoji: "🍽️", title: "식사", desc: `${checklistData[0]?.percent ?? "0%"} 달성` },
              { emoji: "🪥", title: "위생", desc: `${checklistData[1]?.percent ?? "0%"} 관리` },
              { emoji: "🚻", title: "배변", desc: `${checklistData[2]?.percent ?? "0%"} 관리` },
              { emoji: "🟩", title: "환자 상태", desc: riskLevel },
            ].map(({ emoji, title, desc }) => (
              <View key={title} className="w-[48%] bg-guardian-bg-secondary rounded-2xl py-[18px] items-center mb-3">
                <Text className="text-[22px]">{emoji}</Text>
                <Text className="mt-2 font-bold text-guardian-text-primary">{title}</Text>
                <Text className="mt-1 text-[13px] text-guardian-text-neutral">{desc}</Text>
              </View>
            ))}
          </View>

          {/* AI 코멘트 */}
          <View className="bg-guardian-button-secondary rounded-[14px] p-[14px] mt-[6px]">
            <Text className="text-guardian-text-primary font-bold mb-[10px]">💡 AI 분석 코멘트</Text>

            {aiComments.map((line, i) => (
              <View key={i} className="flex-row gap-2 mb-[10px]">
                <Text className="text-[14px] mt-[1px]">💬</Text>
                <Text className="flex-1 text-guardian-text-neutral leading-5 text-[13px]">
                  {line}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 체크리스트 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <TouchableOpacity
            className="flex-row justify-between items-center"
            activeOpacity={0.7}
            onPress={() => toggleSection("checklist")}
          >
            <Text className="text-lg font-bold text-guardian-text-primary">
              1. 요양사 체크리스트 요약
            </Text>
            <Ionicons
              name={sectionOpen.checklist ? "chevron-up" : "chevron-down"}
              size={18}
              color="#503115"
            />
          </TouchableOpacity>

          {sectionOpen.checklist && (
            <>
              {/* 수행률 원 */}
              <View className="w-[130px] h-[130px] rounded-full border-[10px] border-guardian-button-primary justify-center items-center self-center my-5">
                <Text className="text-[28px] font-extrabold text-guardian-text-primary">{overallRate}%</Text>
                <Text className="text-guardian-text-neutral">수행률</Text>
              </View>

              {/* 일별 수행률 */}
              <View className="mb-4">
                <Text className="text-[14px] font-bold text-guardian-text-primary mb-3">
                    일별 수행률 추이
                </Text>
                <View className="flex-row justify-between items-end h-[100px] bg-guardian-bg-secondary rounded-[14px] px-[10px] pt-[10px]">
                  {dailyRates.map((item) => {
                    const barColor =
                      item.rate >= 90 ? "#34A853"
                      : item.rate >= 75 ? "#FCC101"
                      : "#ED584C";
                    return (
                      <View key={item.day} className="flex-1 items-center justify-end h-full">
                        <Text className="text-[9px] text-guardian-text-neutral mb-1 font-bold">
                          {item.rate}%
                        </Text>
                        <View className="w-4 h-[60px] bg-guardian-button-secondary rounded-lg justify-end overflow-hidden">
                          <View style={{ width: "100%", height: `${item.rate}%`, backgroundColor: barColor, borderRadius: 8 }} />
                        </View>
                        <Text className="mt-[6px] mb-2 text-xs font-bold text-guardian-text-neutral">
                          {item.day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View className="flex-row gap-3 mt-[10px]">
                  <Text className="text-[11px] text-guardian-text-neutral">🟢 90% 이상</Text>
                  <Text className="text-[11px] text-guardian-text-neutral">🟡 75~89%</Text>
                  <Text className="text-[11px] text-guardian-text-neutral">🔴 75% 미만</Text>
                </View>
              </View>

              <View className="bg-guardian-bg-secondary rounded-[14px] px-[12px] py-[10px] mb-2">
                <View className="flex-row items-center justify-between mb-[8px]">
                  <Text className="text-[13px] font-bold text-guardian-text-primary">
                    식사 미기입 횟수
                  </Text>
                  <Text className="text-[12px] text-guardian-text-neutral">
                    총 {mealMissingCount.total}회
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {[
                    { label: "아침", value: mealMissingCount.morning },
                    { label: "점심", value: mealMissingCount.lunch },
                    { label: "저녁", value: mealMissingCount.dinner },
                  ].map((slot) => (
                    <View key={slot.label} className="flex-1 bg-background-neutral rounded-xl py-[10px] items-center">
                      <Text className="text-[12px] text-guardian-text-neutral">{slot.label}</Text>
                      <Text className="mt-[4px] text-[16px] font-bold text-guardian-text-primary">{slot.value}회</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 테이블 */}
              <View className="mt-[10px]">
                {checklistData.map((item, index) => {
                  const isExpanded = !!expandedRows[index];
                  const uniqueComments = [...new Set(item.dailyComments.filter((c) => c !== "-"))];
                  const missingComments = uniqueComments.filter((c) => c.includes("미기입"));
                  const summaryComment =
                    missingComments.length > 0
                      ? (missingComments.length === 1
                          ? missingComments[0]
                          : `${missingComments[0]} 외 ${missingComments.length - 1}건`)
                      : uniqueComments.length === 0
                        ? "-"
                        : uniqueComments.length === 1
                          ? uniqueComments[0]
                          : `${uniqueComments[0]} 외 ${uniqueComments.length - 1}건`;
                  const hasMultiple =
                    uniqueComments.length > 1 ||
                    (uniqueComments.length === 1 && item.dailyComments.some((c) => c === "-"));

                  const percentClass =
                    item.percentStyle === "success" ? "text-success-primary font-bold"
                    : item.percentStyle === "warn"    ? "text-guardian-text-secondary font-bold"
                    : "text-error-primary font-bold";

                  return (
                    <View key={index}>
                      <TouchableOpacity
                        className="flex-row justify-between py-3 border-b border-guardian-bg-secondary"
                        onPress={() => toggleRow(index)}
                        activeOpacity={0.7}
                      >
                        <Text className="flex-1 text-guardian-text-primary">{item.label}</Text>
                        <Text className={percentClass}>{item.percent}</Text>
                        <View className="flex-1 flex-row justify-end items-center gap-1">
                          <Text className="text-right text-guardian-text-neutral text-xs" numberOfLines={1}>
                            {summaryComment}
                          </Text>
                          {hasMultiple && (
                            <Text className="text-[10px] text-guardian-text-neutral">
                              {isExpanded ? "▲" : "▼"}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View className="bg-guardian-bg-secondary rounded-xl px-[14px] py-[10px] mb-1 gap-[6px]">
                          {weekDayLabels.map((day, di) => (
                            <View key={di} className="flex-row items-center gap-3">
                              <Text className="w-5 text-[13px] font-bold text-guardian-text-secondary">
                                {day}
                              </Text>
                              <Text
                                className={`text-[13px] flex-1 ${item.dailyComments[di] === "-"
                                  ? "text-guardian-button-primary opacity-40"
                                  : item.label === "상태 안정화" && String(item.dailyComments[di]).includes("컨디션 이상 징후")
                                    ? "text-error-primary font-bold"
                                    : "text-guardian-text-neutral"}`}
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
            </>
          )}
        </View>

        {/* 프로그램 활동 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <TouchableOpacity
            className="flex-row justify-between items-center"
            activeOpacity={0.7}
            onPress={() => toggleSection("program")}
          >
            <Text className="text-lg font-bold text-guardian-text-primary">
              2. 프로그램 활동 및 증진 효과
            </Text>
            <Ionicons
              name={sectionOpen.program ? "chevron-up" : "chevron-down"}
              size={18}
              color="#503115"
            />
          </TouchableOpacity>

          {sectionOpen.program && (
            <>
              {programSection ? (
                <>
                  <View className="bg-guardian-bg-secondary rounded-2xl p-4 mt-4">
                    <Text className="font-bold text-guardian-text-primary mb-2">
                      {programSection.activityTitle || "주간 활동 요약"}
                    </Text>
                    <Text className="text-guardian-text-neutral leading-5">
                      {programSection.activityDescription || "이번 주 돌봄 기록을 바탕으로 활동 요약을 제공합니다."}
                    </Text>
                  </View>

                  {(programSection.effects ?? []).map((effect, idx) => (
                    <View key={`${effect}-${idx}`} className="bg-guardian-bg-secondary rounded-[14px] p-[14px] mt-[14px]">
                      <Text className="font-bold text-guardian-text-primary mb-[6px]">효과 {idx + 1}</Text>
                      <Text className="text-guardian-text-neutral leading-5" numberOfLines={2} ellipsizeMode="tail">
                        {formatEffectTwoLines(effect)}
                      </Text>
                    </View>
                  ))}
                </>
              ) : (
                <View className="bg-guardian-bg-secondary rounded-2xl p-4 mt-4">
                  <Text className="text-guardian-text-neutral leading-5">
                    프로그램 활동 요약 데이터를 불러오지 못했습니다.
                  </Text>
                </View>
              )}

              <View className="bg-success-secondary rounded-[14px] p-[14px] mt-4"
                style={{ borderLeftWidth: 3, borderLeftColor: "#34A853" }}
              >
                <Text className="text-success-primary font-bold text-[14px] mb-1">
                  AI 프로그램 추천
                </Text>
                <Text className="text-[12px] text-guardian-text-neutral mb-3">
                  {nextWeekStartLabel !== "-"
                    ? `${nextWeekStartLabel}부터 신청 가능한 모집 중 프로그램 기준`
                    : "모집 중·신청 가능 프로그램 기준"}
                </Text>

                {categoryRecommendations.length === 0 ? (
                  <Text className="text-[13px] text-guardian-text-neutral leading-5">
                    현재 환자 상태를 분석한 결과, 추가로 추천할 프로그램 분야가 없거나 모집 중인 해당 분야 프로그램이 없습니다.
                  </Text>
                ) : (
                  categoryRecommendations.map((rec, i, arr) => (
                    <View key={`${rec.category}-${i}`} className={`${i < arr.length - 1 ? "mb-4" : ""}`}>
                      <Text className="font-bold text-guardian-text-primary text-[13px] mb-[4px]">
                        {rec.category}
                      </Text>
                      {rec.reason ? (
                        <Text className="text-[12px] text-guardian-text-neutral leading-5 mb-[6px]">
                          {keepPleaseTogether(rec.reason)}
                        </Text>
                      ) : null}
                      {rec.hasProgram ? (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => navigation?.navigate?.("Program")}
                          className="bg-background-neutral rounded-xl px-[12px] py-[10px]"
                        >
                          <Text className="text-[13px] font-bold text-guardian-text-primary">
                            {rec.programTitle}
                          </Text>
                          {rec.programStartAt ? (
                            <Text className="text-[11px] text-guardian-text-neutral mt-[4px]">
                              프로그램 시작: {prettyDate(String(rec.programStartAt).slice(0, 10))}
                            </Text>
                          ) : null}
                          <Text className="text-[11px] text-success-primary font-bold mt-[6px]">
                            프로그램 신청 화면에서 신청하기 →
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text className="text-[13px] text-guardian-text-neutral leading-5">
                          {rec.noProgramMessage || "현재 모집 중인 해당 분야 프로그램이 없습니다."}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </View>

        {/* 처방전 요약 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <TouchableOpacity
            className="flex-row justify-between items-center"
            activeOpacity={0.7}
            onPress={() => toggleSection("prescription")}
          >
            <Text className="text-lg font-bold text-guardian-text-primary">
              3. 처방전 요약
            </Text>
            <Ionicons
              name={sectionOpen.prescription ? "chevron-up" : "chevron-down"}
              size={18}
              color="#503115"
            />
          </TouchableOpacity>

          {sectionOpen.prescription && (
            <>
              {diagnosisSection ? (
                <View className="bg-guardian-bg-secondary rounded-[14px] p-[14px] mt-4">
                  <Text className="text-[13px] font-bold text-guardian-text-primary mb-[6px]">
                    등록 진단 (원무)
                  </Text>
                  {diagnosisSection.diagnosisTitle ? (
                    <Text className="text-[13px] font-semibold text-guardian-text-primary leading-5 mb-[4px]">
                      {diagnosisSection.diagnosisTitle}
                    </Text>
                  ) : null}
                  {diagnosisSection.diagnosisComment ? (
                    <Text className="text-[12px] text-guardian-text-neutral leading-5">
                      {diagnosisSection.diagnosisComment}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <View className="bg-guardian-bg-secondary rounded-[14px] p-[14px] mt-4">
                <Text className="text-[13px] font-bold text-guardian-text-primary mb-[6px]">
                  AI 복약·상태 분석
                </Text>
                <Text className="text-guardian-text-neutral leading-5">
                  {prescriptionSection?.summaryText
                    ?? "등록된 처방전 요약 데이터가 없습니다."}
                </Text>
              </View>

              {(prescriptionSection?.medicationHighlights ?? []).length > 0 ? (
                <View className="bg-guardian-bg-secondary rounded-[14px] p-[14px] mt-[14px]">
                  <Text className="font-bold text-guardian-text-primary mb-[8px]">등록 약 요약</Text>
                  {prescriptionSection.medicationHighlights.map((line, i) => (
                    <View key={`med-${i}`} className="flex-row gap-2 mb-[8px]">
                      <Text className="text-guardian-text-secondary">•</Text>
                      <Text className="flex-1 text-[13px] text-guardian-text-neutral leading-5">{line}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {(prescriptionSection?.cautions ?? []).length > 0 ? (
                <View
                  className="bg-error-secondary rounded-[14px] p-[14px] mt-[14px]"
                  style={{ borderLeftWidth: 3, borderLeftColor: "#ED584C" }}
                >
                  <Text className="text-error-primary font-bold text-[14px] mb-[8px]">주의 사항</Text>
                  {prescriptionSection.cautions.map((line, i) => (
                    <Text key={`caution-${i}`} className="text-[13px] text-guardian-text-neutral leading-5 mb-[6px]">
                      • {line}
                    </Text>
                  ))}
                </View>
              ) : null}

              {(prescriptionSection?.careTips ?? []).length > 0 ? (
                <View
                  className="bg-success-secondary rounded-[14px] p-[14px] mt-[14px]"
                  style={{ borderLeftWidth: 3, borderLeftColor: "#34A853" }}
                >
                  <Text className="text-success-primary font-bold text-[14px] mb-[8px]">돌봄·복약 팁</Text>
                  {prescriptionSection.careTips.map((line, i) => (
                    <Text key={`tip-${i}`} className="text-[13px] text-guardian-text-neutral leading-5 mb-[6px]">
                      • {line}
                    </Text>
                  ))}
                </View>
              ) : null}

              {(prescriptionSection?.medications ?? []).length > 0 ? (
                <View className="mt-[14px]">
                  <Text className="text-[13px] font-bold text-guardian-text-primary mb-[8px]">
                    스캔 등록 처방전 ({prescriptionSection.medications.length}건)
                  </Text>
                  {prescriptionSection.medications.map((m) => (
                    <View
                      key={m.medicationId}
                      className="bg-guardian-bg-secondary rounded-xl px-[12px] py-[10px] mb-[8px]"
                    >
                      <Text className="text-[13px] text-guardian-text-neutral">
                        {prettyDate(m.prescriptionDate)} · {m.medicineSummary ?? "처방전"}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
          </>
        ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}