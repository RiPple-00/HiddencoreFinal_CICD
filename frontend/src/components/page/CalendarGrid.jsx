import React, { useMemo } from "react";
import { generateCalendar, isSameDay } from "../../utils/calendarUtils";
import { toDate, formatDate as fmtDate } from "../../utils/dateUtils";

const pad2 = (n) => String(n).padStart(2, "0");

const getScheduleStartEndDates = (schedule) => {
  const start = toDate(schedule?.scheduledAt);
  let end = toDate(schedule?.endAt) || start;
  if (!start) return null;
  // end가 start보다 빠르면 보정
  if (end && end.getTime() < start.getTime()) end = start;
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return { start, end, startDay, endDay };
};

const typeStyle = (type) => {
  if (type === "PROGRAM") return { bg: "#dbeafe", border: "#93c5fd", text: "#1d4ed8" };
  if (type === "PERSONAL") return { bg: "#fee2e2", border: "#fca5a5", text: "#b91c1c" };
  return { bg: "#e5e7eb", border: "#d1d5db", text: "#374151" };
};

const rainbow = [
  { bg: "#fee2e2", border: "#fca5a5", text: "#b91c1c" }, // red
  { bg: "#ffedd5", border: "#fdba74", text: "#c2410c" }, // orange
  { bg: "#fef9c3", border: "#facc15", text: "#a16207" }, // yellow
  { bg: "#dcfce7", border: "#86efac", text: "#166534" }, // green
  { bg: "#dbeafe", border: "#93c5fd", text: "#1d4ed8" }, // blue
  { bg: "#e0e7ff", border: "#a5b4fc", text: "#3730a3" }, // indigo
  { bg: "#f3e8ff", border: "#d8b4fe", text: "#6b21a8" }, // violet
];

const getStartDayKey = (schedule) => {
  const start = toDate(schedule?.scheduledAt);
  if (!start) return null;
  return `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
};

const getScheduleKey = (schedule) => String(schedule?.scheduleId ?? `${schedule?.title ?? "schedule"}-${getStartDayKey(schedule) ?? ""}`);

const buildColorMapByDay = (schedules) => {
  const byDay = new Map(); // dayKey -> schedule[]
  for (const s of schedules) {
    const dayKey = getStartDayKey(s);
    if (!dayKey) continue;
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey).push(s);
  }
  // 시간순 정렬 후 인덱스 부여
  const colorMap = new Map(); // scheduleKey -> {bg,border,text}
  for (const [dayKey, list] of byDay.entries()) {
    if (list.length < 2) continue; // 2개 이상일 때만 rainbow 적용
    list.sort((a, b) => {
      const ta = toDate(a?.scheduledAt)?.getTime() ?? 0;
      const tb = toDate(b?.scheduledAt)?.getTime() ?? 0;
      return ta - tb;
    });
    list.forEach((s, idx) => {
      colorMap.set(getScheduleKey(s), rainbow[idx % rainbow.length]);
    });
  }
  return colorMap;
};

const buildWeekBars = (weekDates, schedules) => {
  const weekStart = new Date(
    weekDates[0].getFullYear(),
    weekDates[0].getMonth(),
    weekDates[0].getDate()
  );
  const weekEnd = new Date(
    weekDates[6].getFullYear(),
    weekDates[6].getMonth(),
    weekDates[6].getDate()
  );

  const segments = [];
  for (const s of schedules) {
    const se = getScheduleStartEndDates(s);
    if (!se) continue;
    if (se.endDay < weekStart || se.startDay > weekEnd) continue;

    const segStart = se.startDay < weekStart ? weekStart : se.startDay;
    const segEnd = se.endDay > weekEnd ? weekEnd : se.endDay;

    const startIdx = weekDates.findIndex((d) => isSameDay(d, segStart));
    const endIdx = weekDates.findIndex((d) => isSameDay(d, segEnd));
    if (startIdx < 0 || endIdx < 0) continue;

    segments.push({
      schedule: s,
      startIdx,
      endIdx,
      isMultiDay: se.endDay.getTime() !== se.startDay.getTime(),
    });
  }

  const mealLaneOrder = (seg) => {
    const m = String(seg?.schedule?.mealType ?? "").toUpperCase();
    const o = { BREAKFAST: 0, LUNCH: 1, DINNER: 2 };
    return o[m] ?? 99;
  };

  segments.sort((a, b) => {
    if (a.isMultiDay !== b.isMultiDay) return a.isMultiDay ? -1 : 1;
    if (a.startIdx !== b.startIdx) return a.startIdx - b.startIdx;
    if (a.endIdx !== b.endIdx) return b.endIdx - a.endIdx;
    return mealLaneOrder(a) - mealLaneOrder(b);
  });

  const lanes = [];
  const placed = [];

  const conflicts = (range, lane) =>
    lane.some((r) => !(range.endIdx < r.startIdx || range.startIdx > r.endIdx));

  for (const seg of segments) {
    let laneIndex = lanes.findIndex((lane) => !conflicts(seg, lane));
    if (laneIndex === -1) {
      lanes.push([]);
      laneIndex = lanes.length - 1;
    }
    lanes[laneIndex].push({ startIdx: seg.startIdx, endIdx: seg.endIdx });
    placed.push({ ...seg, laneIndex });
  }

  return { placed, laneCount: lanes.length };
};

const CalendarGrid = ({ year, month, schedules = [], selectedDate, onDateClick, onScheduleClick }) => {
  const weeks = useMemo(() => {
    const baseDate = new Date(year, month - 1, 1);
    return generateCalendar(baseDate);
  }, [year, month]);

  const today = new Date();
  const rainbowColorMap = useMemo(() => buildColorMapByDay(schedules), [schedules]);
  const isScheduleClickable = typeof onScheduleClick === "function";

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="grid grid-cols-7 bg-blue-50 border-b border-gray-200 font-semibold text-blue-700 text-sm">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <div key={d} className="py-2 text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="divide-y divide-gray-200">
        {weeks.map((week, wIdx) => {
          const { placed, laneCount } = buildWeekBars(week, schedules);
          // bar 간격: 거의 붙게 (rowGap 1px)
          const barHeight = 16;
          const rowGap = 2;
          // 날짜 숫자 아래부터 bar가 시작되도록 여유를 둠
          const barsTopPadding = 28;
          const overlayHeight =
            barsTopPadding +
            (laneCount > 0 ? laneCount * barHeight + (laneCount - 1) * rowGap : 0) +
            6;

          return (
            <div key={wIdx} className="relative">
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: 0, height: overlayHeight, zIndex: 5 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gridAutoRows: `${barHeight}px`,
                    rowGap: `${rowGap}px`,
                    paddingTop: `${barsTopPadding}px`,
                    height: "100%",
                    paddingLeft: "1px",
                    paddingRight: "1px",
                  }}
                >
                  {placed.map(({ schedule, startIdx, endIdx, laneIndex }) => {
                    const style =
                      rainbowColorMap.get(getScheduleKey(schedule)) ?? typeStyle(schedule?.type);
                    const gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
                    const gridRow = `${laneIndex + 1}`;

                    return (
                      <div
                        key={`${schedule?.scheduleId ?? schedule?.title}-${startIdx}-${endIdx}-${laneIndex}`}
                        style={{ gridColumn, gridRow, margin: "0 2px" }}
                      >
                        <div
                          className={isScheduleClickable ? "pointer-events-auto" : "pointer-events-none"}
                          role={isScheduleClickable ? "button" : undefined}
                          tabIndex={isScheduleClickable ? 0 : -1}
                          onClick={isScheduleClickable ? () => onScheduleClick(schedule) : undefined}
                          onKeyDown={isScheduleClickable ? (e) => {
                            if (e.key === "Enter") onScheduleClick(schedule);
                          } : undefined}
                          style={{
                            height: barHeight,
                            borderRadius: 6,
                            background: style.bg,
                            border: `1px solid ${style.border}`,
                            color: style.text,
                            fontSize: 11,
                            lineHeight: "14px",
                            padding: "1px 6px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            cursor: isScheduleClickable ? "pointer" : "default",
                            fontWeight: 500,
                          }}
                          title={schedule?.title}
                        >
                          {schedule?.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-7">
                {week.map((date, dIdx) => {
                  const isCurrentMonth = date.getMonth() === month - 1;
                  const dateString = fmtDate(date);
                  const isSelected = selectedDate === dateString;
                  const isToday = isSameDay(date, today);

                  return (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={() => onDateClick?.(dateString)}
                      className={[
                        "relative text-left border-r border-b border-gray-200 last:border-r-0",
                        // 높이를 더 크게: 96px → 110px
                        "h-[110px] px-2 pt-6 pb-2",
                        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
                      ].join(" ")}
                      style={{ outline: isSelected || isToday ? "2px solid #2563eb" : "none", outlineOffset: -2 }}
                    >
                      <div className="absolute top-1 left-2 text-xs font-semibold z-10">
                        {date.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;