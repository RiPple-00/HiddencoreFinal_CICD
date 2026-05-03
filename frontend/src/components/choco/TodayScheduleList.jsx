import React from "react";
import { formatTime, toDate } from "../../utils/dateUtils";

// 선택한 날짜의 일정 하단 목록
const TodayScheduleList = ({
  date,
  schedules = [],
  onScheduleClick,
  onAddClick,
  addDisabled = false,
  emptyMessage = "해당 날짜에 일정이 없습니다.",
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xl font-bold">{date}</div>
        <button
          type="button"
          onClick={onAddClick}
          disabled={addDisabled}
          className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          + 추가
        </button>
      </div>
      {schedules.length === 0 ? (
        <div className="text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {schedules.map((schedule) => {
            const d = toDate(schedule.scheduledAt);
            return (
              <button
                key={schedule.scheduleId ?? `${schedule.title}-${schedule.scheduledAt}`}
                type="button"
                onClick={() => onScheduleClick?.(schedule)}
                className="text-left bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold truncate">{schedule.title}</div>
                  {d ? <div className="text-xs text-gray-500 shrink-0">{formatTime(d)}</div> : null}
                </div>
                {schedule.content ? (
                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">{schedule.content}</div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodayScheduleList;