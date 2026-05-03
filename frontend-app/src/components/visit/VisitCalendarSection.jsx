import React, { useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const WEEKDAYS = [
  { label: "SUN", color: "#DC2626" },
  { label: "MON", color: "#111827" },
  { label: "TUE", color: "#111827" },
  { label: "WED", color: "#111827" },
  { label: "THU", color: "#111827" },
  { label: "FRI", color: "#111827" },
  { label: "SAT", color: "#2563EB" },
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
    cells.push({
      key: `p-${day}`,
      inMonth: false,
      date: new Date(viewYear, viewMonthIndex - 1, day),
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      key: `c-${d}`,
      inMonth: true,
      date: new Date(viewYear, viewMonthIndex, d),
    });
  }
  const tail = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= tail; i++) {
    cells.push({
      key: `n-${i}`,
      inMonth: false,
      date: new Date(viewYear, viewMonthIndex + 1, i),
    });
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

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonthIndex),
    [viewYear, viewMonthIndex]
  );

  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < cells.length; i += 7) {
      r.push(cells.slice(i, i + 7));
    }
    return r;
  }, [cells]);

  const goPrevMonth = useCallback(() => {
    if (viewMonthIndex === 0) {
      setViewYear((y) => y - 1);
      setViewMonthIndex(11);
    } else {
      setViewMonthIndex((m) => m - 1);
    }
  }, [viewMonthIndex]);

  const goNextMonth = useCallback(() => {
    if (viewMonthIndex === 11) {
      setViewYear((y) => y + 1);
      setViewMonthIndex(0);
    } else {
      setViewMonthIndex((m) => m + 1);
    }
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
    <View style={cal.card}>
      <View style={cal.monthRow}>
        <TouchableOpacity onPress={goPrevMonth} hitSlop={10}>
          <Text style={cal.monthNav}>‹</Text>
        </TouchableOpacity>
        <Text style={cal.monthTitle}>{monthTitle}</Text>
        <TouchableOpacity onPress={goNextMonth} hitSlop={10}>
          <Text style={cal.monthNav}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={cal.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w.label} style={[cal.weekCell, { color: w.color }]}>
            {w.label}
          </Text>
        ))}
      </View>

      <View style={cal.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={cal.row}>
            {row.map((cell) => {
              const d = cell.date.getDate();
              const selected = sel && isSameDay(sel, cell.date);
              return (
                <TouchableOpacity
                  key={cell.date.getTime()}
                  style={cal.dayTouch}
                  onPress={() => onPressDay(cell.date, cell.inMonth)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      cal.dayInner,
                      selected && cal.daySelected,
                      !cell.inMonth && cal.dayMuted,
                    ]}
                  >
                    <Text
                      style={[
                        cal.dayText,
                        selected && cal.dayTextSelected,
                        !cell.inMonth && cal.dayTextMuted,
                      ]}
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

const cal = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  monthNav: {
    fontSize: 22,
    color: "#0B4EA2",
    paddingHorizontal: 12,
    fontWeight: "600",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B4EA2",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  grid: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayTouch: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  daySelected: {
    backgroundColor: "#0B4EA2",
  },
  dayMuted: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  dayTextSelected: {
    color: "#fff",
  },
  dayTextMuted: {
    color: "#9CA3AF",
  },
});

export default VisitCalendarSection;
