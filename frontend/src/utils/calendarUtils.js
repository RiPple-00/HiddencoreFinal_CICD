import { toDate } from './dateUtils';

// 월 시작일 계산
export const getStartOfMonth = (date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfMonth;
};

// 월 마지막일 계산
export const getEndOfMonth = (date) => {
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfMonth;
};

// 달력 6주 배열 만들기
export const generateCalendar = (date) => {
  const startOfMonth = getStartOfMonth(date);
  const calendar = [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
  ];

  // 달력 시작일을 일요일로 맞춤
  let currentDate = new Date(startOfMonth);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      calendar[week][day] = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  return calendar;
};

// 날짜 비교 함수
export const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 해당 날짜 일정 필터
export const filterSchedulesByDate = (schedules, date) => {
  return schedules.filter((schedule) => {
    const scheduleDate = toDate(schedule.scheduledAt);
    if (!scheduleDate) return false;
    return isSameDay(scheduleDate, date);
  });
};
