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

/** 월 단위로 고정되는 난수 (같은 달은 같은 색 배치) */
function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lightStyleFromHue(h) {
  const hue = ((h % 360) + 360) % 360;
  return {
    bg: `hsl(${hue}, 58%, 91%)`,
    border: `hsl(${hue}, 42%, 78%)`,
    text: `hsl(${hue}, 38%, 30%)`,
  };
}

const fallbackBarStyle = { bg: "#f3f4f6", border: "#d1d5db", text: "#4b5563" };

/** 해당 월에 보이는 일정마다 서로 다른 연한 색 (월·년 시드로 시작 각도만 무작위) */
function buildMonthScheduleColorMap(year, month, schedules) {
  const map = new Map();
  const byKey = new Map();
  for (const s of schedules) {
    const k = getScheduleKey(s);
    if (!byKey.has(k)) byKey.set(k, s);
  }
  const unique = [...byKey.values()];
  unique.sort((a, b) => {
    const ida = Number(a?.scheduleId);
    const idb = Number(b?.scheduleId);
    if (!Number.isNaN(ida) && !Number.isNaN(idb) && ida !== idb) return ida - idb;
    return String(getScheduleKey(a)).localeCompare(String(getScheduleKey(b)));
  });
  if (unique.length === 0) return map;
  const rng = mulberry32(((year * 12 + month) ^ 0x9e3779b9) >>> 0);
  const startHue = rng() * 360;
  // 황금각: 일정이 늘어나도 기존 id 순서·색이 유지되고, 한 달 안에서 서로 다른 색에 가깝게 분산
  const GOLDEN_ANGLE = 137.508;
  unique.forEach((s, i) => {
    map.set(getScheduleKey(s), lightStyleFromHue(startHue + i * GOLDEN_ANGLE));
  });
  return map;
}

const getStartDayKey = (schedule) => {
  const start = toDate(schedule?.scheduledAt);
  if (!start) return null;
  return `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
};

const getScheduleKey = (schedule) => String(schedule?.scheduleId ?? `${schedule?.title ?? "schedule"}-${getStartDayKey(schedule) ?? ""}`);

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

const CalendarGrid = ({ year, month, schedules = [], selectedDate, onDateClick }) => {
  const weeks = useMemo(() => {
    const baseDate = new Date(year, month - 1, 1);
    return generateCalendar(baseDate);
  }, [year, month]);

  const today = new Date();
  const scheduleColorMap = useMemo(
    () => buildMonthScheduleColorMap(year, month, schedules),
    [year, month, schedules]
  );

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
          // bar 간격: Meal 캘린더(page)와 동일
          const barHeight = 16;
          const rowGap = 2;
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
                    const style = scheduleColorMap.get(getScheduleKey(schedule)) ?? fallbackBarStyle;
                    const gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
                    const gridRow = `${laneIndex + 1}`;

                    return (
                      <div
                        key={`${schedule?.scheduleId ?? schedule?.title}-${startIdx}-${endIdx}-${laneIndex}`}
                        style={{ gridColumn, gridRow, margin: "0 2px" }}
                      >
                        <div
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
                            cursor: "default",
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