import React from "react";

// 날짜 칸 1개
// 오늘 테두리
// 일정 미리보기

const CalendarCell = ({ date, isToday, schedules, onScheduleClick }) => {
    return (
        <div style={{ padding: 8, minHeight: 70 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: isToday ? 800 : 600, color: isToday ? "#c2410c" : "#111" }}>
                    {date.getDate()}
                </div>
                {isToday ? (
                    <span style={{ fontSize: 12, color: "#c2410c", fontWeight: 700 }}>TODAY</span>
                ) : null}
            </div>
            <div style={{ marginTop: 4, display: "grid", gap: 4 }}>
                {schedules?.slice(0, 3).map((schedule, index) => (
                    <div
                        key={schedule.scheduleId ?? index}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onScheduleClick?.(schedule);
                        }}
                        style={{
                            all: "unset",
                            cursor: "pointer",
                            fontSize: "0.8em",
                            background: "#fff7ed",
                            border: "1px solid #fed7aa",
                            borderRadius: 8,
                            padding: "2px 6px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        title={schedule.title}
                    >
                        {schedule.title}
                    </div>
                ))}
                {schedules?.length > 3 ? (
                    <div style={{ fontSize: 12, color: "#666" }}>+{schedules.length - 3}개 더</div>
                ) : null}
            </div>
        </div>
    );
}

export default CalendarCell;