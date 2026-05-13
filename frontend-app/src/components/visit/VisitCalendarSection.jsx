import React, { useMemo, useState, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "../Text";

const WEEKDAYS = [
  { label: "SUN", colorClass: "text-error-primary" },
  { label: "MON", colorClass: "text-guardian-text-primary" },
  { label: "TUE", colorClass: "text-guardian-text-primary" },
  { label: "WED", colorClass: "text-guardian-text-primary" },
  { label: "THU", colorClass: "text-guardian-text-primary" },
  { label: "FRI", colorClass: "text-guardian-text-primary" },
  { label: "SAT", colorClass: "text-guardian-text-secondary" },
];

function stripTime(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthCells(viewYear, viewMonthIndex) {
  const first = new Date(viewYear, viewMonthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
  const prevMonthLast = new Date(viewYear, viewMonthIndex, 0).getDate();

  const cells = [];
  for (let i = 0; i < startPad; i++) {
    const day = prevMonthLast - startPad + i + 1;
    cells.push({ key: `p-${day}`, inMonth: false, date: new Date(viewYear, viewMonthIndex - 1, day) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: `c-${d}`, inMonth: true, date: new Date(viewYear, viewMonthIndex, d) });
  }
  const tail = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= tail; i++) {
    cells.push({ key: `n-${i}`, inMonth: false, date: new Date(viewYear, viewMonthIndex + 1, i) });
  }
  return cells;
}

/**
 * 월 그리드 달력. props: selectedDate(Date), onDateChange(Date)
 * Expo React Native용 (기존 react-calendar + div 대체, API 동일)
 */
const VisitCalendarSection = ({ selectedDate, onDateChange }) => {
  const initial = stripTime(selectedDate || new Date());
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState(initial.getMonth());

  const cells = useMemo(() => buildMonthCells(viewYear, viewMonthIndex), [viewYear, viewMonthIndex]);

  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < cells.length; i += 7) r.push(cells.slice(i, i + 7));
    return r;
  }, [cells]);

  const goPrevMonth = useCallback(() => {
    if (viewMonthIndex === 0) { setViewYear((y) => y - 1); setViewMonthIndex(11); }
    else setViewMonthIndex((m) => m - 1);
  }, [viewMonthIndex]);

  const goNextMonth = useCallback(() => {
    if (viewMonthIndex === 11) { setViewYear((y) => y + 1); setViewMonthIndex(0); }
    else setViewMonthIndex((m) => m + 1);
  }, [viewMonthIndex]);

  const monthTitle = `${viewYear}년 ${viewMonthIndex + 1}월`;

  const onPressDay = (date, inMonth) => {
    onDateChange?.(stripTime(date));
    if (!inMonth) {
      setViewYear(date.getFullYear());
      setViewMonthIndex(date.getMonth());
    }
  };

  const sel = selectedDate ? stripTime(selectedDate) : null;

  return (
    <View className="bg-background-neutral rounded-2xl py-3 px-2 border border-guardian-button-secondary">

      {/* 월 네비게이션 */}
      <View className="flex-row items-center justify-between px-1 mb-2">
        <TouchableOpacity onPress={goPrevMonth} hitSlop={10}>
          <Text className="text-[22px] text-guardian-text-primary font-bold px-3">‹</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-guardian-text-primary">{monthTitle}</Text>
        <TouchableOpacity onPress={goNextMonth} hitSlop={10}>
          <Text className="text-[22px] text-guardian-text-primary font-bold px-3">›</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View className="flex-row mb-[6px]">
        {WEEKDAYS.map((w) => (
          <Text
            key={w.label}
            className={`flex-1 text-center text-[11px] font-bold ${w.colorClass}`}
          >
            {w.label}
          </Text>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View>
        {rows.map((row, ri) => (
          <View key={ri} className="flex-row justify-between">
            {row.map((cell) => {
              const d = cell.date.getDate();
              const selected = sel && isSameDay(sel, cell.date);
              return (
                <TouchableOpacity
                  key={cell.date.getTime()}
                  className="flex-1 items-center justify-center py-1"
                  onPress={() => onPressDay(cell.date, cell.inMonth)}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-9 h-9 rounded-lg justify-center items-center ${selected ? "bg-guardian-button-primary" : ""
                      } ${!cell.inMonth ? "opacity-35" : ""
                      }`}
                  >
                    <Text
                      className={`text-[15px] font-bold ${selected
                        ? "text-guardian-text-primary"   // 노란 배경 위 갈색
                        : "text-guardian-text-neutral"   // 기본 날짜
                        }`}
                    >
                      {d}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default VisitCalendarSection;