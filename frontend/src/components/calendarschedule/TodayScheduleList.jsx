import React from "react";
import { formatTime, toDate } from "../../utils/dateUtils";
import { useI18n } from "../../hooks/useI18n";
import { useTranslatedTexts } from "../../hooks/useTranslate";

const TodayScheduleList = ({
  date,
  schedules = [],
  onScheduleClick,
  onAddClick,
  addDisabled = false,
  emptyMessage,
}) => {
  const { t } = useI18n();
  const empty = emptyMessage ?? t('calendar.noSchedule');

  // DB에서 오는 일정 제목·내용을 현재 언어로 AI 번역
  const scheduleTexts = schedules.flatMap((s) =>
    [s.title, s.content].filter(Boolean)
  );
  const getTranslated = useTranslatedTexts(scheduleTexts);

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
          {t('calendar.add')}
        </button>
      </div>
      {schedules.length === 0 ? (
        <div className="text-gray-500">{empty}</div>
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
                  <div className="font-semibold truncate">{getTranslated(schedule.title)}</div>
                  {d ? <div className="text-xs text-gray-500 shrink-0">{formatTime(d)}</div> : null}
                </div>
                {schedule.content ? (
                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">{getTranslated(schedule.content)}</div>
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
