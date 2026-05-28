import React, { useMemo } from "react";
import { View } from "react-native";
import Text from "../../Text";
import { isRedCalendarDay } from "../../../utils/koreanHolidays";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** 일정 점 색 (안정적으로 schedule id 기준) */
const DOT_PALETTE = [
  "#71BC1B",
  "#5C86BF",
  "#F4C86B",
  "#E8A86E",
  "#C77B56",
  "#ED584C",
  "#2D9C8E",
  "#9B59B3",
];

function stripTime(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 이번 주 일요일 00:00 (한국 달력 관례: 주 시작 = 일요일) */
function getWeekStartSunday(anchor) {
  const d = stripTime(anchor);
  const dow = d.getDay();
  d.setDate(d.getDate() - dow);
  return d;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function colorForKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i) * 31) % DOT_PALETTE.length;
  }
  return DOT_PALETTE[Math.abs(hash)];
}

/** 데모 일정: 오늘 기준 ±14일, 짧은 제목 */
function buildDemoSchedules(anchor) {
  const templates = [
    { offset: 0, title: "건강검진" },
    { offset: 1, title: "약 받아오기" },
    { offset: 3, title: "오후 12시 미술 프로그램" },
    { offset: 5, title: "오후 1시 가족 면회" },
    { offset: 9, title: "오전 혈압 체크" },
    { offset: 11, title: "오후 2시 종이접기 프로그램" },
    { offset: 13, title: "오후 1시 가족 외출" },
  ];
  const weekStart = getWeekStartSunday(anchor);
  const list = [];
  templates.forEach((t, idx) => {
    const day = addDays(weekStart, t.offset);
    const id = `demo-${t.offset}`;
    list.push({
      id,
      date: day,
      title: t.title,
      color: colorForKey(id),
    });
  });
  return list;
}

function groupByDate(schedules) {
  const map = {};
  schedules.forEach((s) => {
    const key = dateKey(s.date);
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return map;
}

/**
 * 이번 주 + 다음 주(14일) 달력
 * - 오늘: primary 배경 + 흰 글자
 * - 일정 있는 날: 하단 색 점
 * - 하단: 색 점 + 짧은 일정명
 */
export default function CaregiverCalendar({
  schedules: schedulesProp,
  today = new Date(),
}) {
  const todayStripped = useMemo(() => stripTime(today), [today]);
  const schedules = useMemo(() => {
    const base = schedulesProp?.length ? schedulesProp : buildDemoSchedules(todayStripped);
    return base.map((s) => ({
      ...s,
      date: stripTime(s.date instanceof Date ? s.date : new Date(s.date)),
    }));
  }, [schedulesProp, todayStripped]);

  const byDate = useMemo(() => groupByDate(schedules), [schedules]);

  const weekStart = useMemo(
    () => getWeekStartSunday(todayStripped),
    [todayStripped],
  );

  const days14 = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weeks = useMemo(
    () => [days14.slice(0, 7), days14.slice(7, 14)],
    [days14],
  );

  const monthHint = useMemo(() => {
    const m0 = days14[0].getMonth() + 1;
    const m1 = days14[13].getMonth() + 1;
    if (m0 === m1) return `${days14[0].getFullYear()}년 ${m0}월`;
    return `${days14[0].getFullYear()}년 ${m0}월 · ${m1}월`;
  }, [days14]);

  const legendItems = useMemo(() => {
    return [...schedules]
      .sort((a, b) => a.date - b.date)
      .map((s) => {
        const m = String(s.date.getMonth() + 1).padStart(2, "0");
        const d = String(s.date.getDate()).padStart(2, "0");
        return {
          id: s.id,
          label: `${m}/${d} ${s.title}`,
          color: s.color || colorForKey(String(s.id ?? s.title)),
        };
      });
  }, [schedules]);

  const renderDay = (date, colIdx, isLastRow) => {
    const key = dateKey(date);
    const daySchedules = byDate[key] || [];
    const isToday = isSameDay(date, todayStripped);
    const isRedDay = isRedCalendarDay(date);
    const dayNum = date.getDate();

    return (
      <View
        key={key}
        className={`flex-1 items-center py-1 min-h-[58px] border-r border-caregiver-bg-secondary ${
          colIdx === 6 ? "border-r-0" : ""
        } ${isLastRow ? "" : "border-b border-caregiver-bg-secondary"}`}
      >
        <View
          className={`w-9 h-9 rounded-lg justify-center items-center mb-1 ${
            isToday ? "bg-caregiver-button-primary" : ""
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              isToday
                ? "text-white"
                : isRedDay
                  ? "text-error-primary"
                  : "text-caregiver-text-primary"
            }`}
          >
            {dayNum}
          </Text>
        </View>
        {daySchedules.length > 0 && (
          <View className="flex-row flex-wrap justify-center gap-[3px] px-0.5 max-w-[36px]">
            {daySchedules.slice(0, 4).map((s) => (
              <View
                key={s.id}
                className="w-[5px] h-[5px] rounded-full"
                style={{ backgroundColor: s.color }}
              />
            ))}
            {daySchedules.length > 4 && (
              <Text className="text-[8px] text-caregiver-text-neutral">+</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="mx-4 mt-4">
      <View className="bg-background-neutral rounded-2xl p-4 border border-caregiver-button-secondary">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-bold text-caregiver-text-primary">
            2주 일정
          </Text>
          <Text className="text-xs text-caregiver-text-neutral">{monthHint}</Text>
        </View>

        <View className="border border-caregiver-bg-secondary rounded-lg overflow-hidden">
          <View className="flex-row border-b border-caregiver-bg-secondary bg-caregiver-bg-secondary/40">
            {WEEKDAY_LABELS.map((label, i) => (
              <View
                key={label}
                className={`flex-1 py-1.5 border-r border-caregiver-bg-secondary ${
                  i === 6 ? "border-r-0" : ""
                }`}
              >
                <Text
                  className={`text-center text-[11px] font-bold ${
                    i === 0 ? "text-error-primary" : "text-caregiver-text-neutral"
                  }`}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} className="flex-row">
              {week.map((date, colIdx) => renderDay(date, colIdx, wi === weeks.length - 1))}
            </View>
          ))}
        </View>

        {legendItems.length > 0 && (
          <View className="mt-4 pt-3 border-t border-caregiver-bg-secondary">
            <Text className="text-xs font-bold text-caregiver-text-neutral mb-2">
              일정
            </Text>
            {legendItems.map((item) => (
              <View key={item.id} className="flex-row items-center mb-1.5">
                <Text className="text-sm mr-2" style={{ color: item.color }}>
                  ●
                </Text>
                <Text className="text-sm text-caregiver-text-primary flex-1" numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
