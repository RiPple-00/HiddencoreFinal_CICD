import React, { useEffect, useMemo, useState } from "react";
import {
  getScheduleList,
  createPersonalSchedule,
  deleteSchedule,
  updateSchedule,
} from "../api/scheduleApi";
import CalendarHeader from "../components/choco/CalendarHeader";
import CalendarGrid from "../components/choco/CalendarGrid";
import ScheduleFormModal from "../components/choco/ScheduleFormModal";
import ScheduleDetailPanel from "../components/choco/ScheduleDetailPanel";
import TodayScheduleList from "../components/choco/TodayScheduleList";
import TopNavBar from "../components/bedroom/TopNavBar";
import { formatDate, toDate } from "../utils/dateUtils";
import { useAuth } from '../contexts/AutoContext.jsx';

const pad2 = (n) => String(n).padStart(2, "0");

function scheduleTouchesDateKey(dateKey, schedule) {
  const start = toDate(schedule.scheduledAt);
  let end = toDate(schedule.endAt) || start;
  if (!start) return false;
  if (end.getTime() < start.getTime()) end = start;
  const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const startKey = dayKey(start);
  const endKey = dayKey(end);
  return dateKey >= startKey && dateKey <= endKey;
}

function formatDisplayDate(dateKey) {
  if (!dateKey || typeof dateKey !== "string") return "";
  const p = dateKey.slice(0, 10).split("-");
  if (p.length !== 3) return dateKey;
  return `${p[0]}/${p[1]}/${p[2]}`;
}

function SchedulePage() {
  const today = new Date();
  const { user } = useAuth();
  const token = user?.accessToken ?? user?.token;
  const jwtPayload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const facilityId = jwtPayload.facilityId ?? null;
  const createdUserId = jwtPayload.sub ?? null;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [filter, setFilter] = useState("ALL");
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      const data = await getScheduleList(facilityId, year, month, filter);

      const scheduleData = data?.schedules || data?.data?.schedules || data || [];
      setSchedules(scheduleData);

      console.log("가져온 일정:", scheduleData);
    } catch (error) {
      console.error("일정 가져오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [year, month, filter]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const handleDateClick = (dateString) => {
    setSelectedDate(dateString);
    setViewingSchedule(null);
    setIsFormOpen(false);
  };

  const handleOpenForm = () => {
    setViewingSchedule(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleCreateSchedule = async (formData) => {
    try {
      setLoading(true);

      const payload = toCreateRequest({
        facilityId,
        createdUserId,
        formData,
      });

      const created = await createPersonalSchedule(payload);

      setIsFormOpen(false);
      if (created) {
        setSchedules((prev) => [created, ...prev]);
      }
      await fetchSchedules();
    } catch (error) {
      console.error("일정 등록 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (schedule) => {
    setIsFormOpen(false);
    setViewingSchedule(schedule);
  };

  const handleCloseDetail = () => {
    setViewingSchedule(null);
  };

  const handleUpdateSchedule = async (formData) => {
    if (!viewingSchedule?.scheduleId) return;
    try {
      setLoading(true);
      const payload = toUpdateRequest({
        facilityId,
        createdUserId,
        patientId: viewingSchedule.patientId ?? null,
        formData,
      });
      await updateSchedule(viewingSchedule.scheduleId, payload);
      setViewingSchedule(null);
      await fetchSchedules();
    } catch (error) {
      console.error("일정 수정 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetail = async () => {
    if (!viewingSchedule?.scheduleId) return;
    const ok = window.confirm("이 일정을 삭제할까요?");
    if (!ok) return;
    try {
      setLoading(true);
      await deleteSchedule(viewingSchedule.scheduleId);
      setViewingSchedule(null);
      await fetchSchedules();
    } catch (error) {
      console.error("일정 삭제 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDaySchedules = useMemo(() => {
    const key = selectedDate?.slice(0, 10);
    if (!key) return [];
    return schedules
      .filter((s) => scheduleTouchesDateKey(key, s))
      .sort((a, b) => (toDate(a.scheduledAt)?.getTime() ?? 0) - (toDate(b.scheduledAt)?.getTime() ?? 0));
  }, [schedules, selectedDate]);

  const displayDateLabel = formatDisplayDate(selectedDate);

  return (
    <>
      <TopNavBar activeNav="calendar" />
      <div className="space-y-6 px-6 py-6">
      <CalendarHeader
        year={year}
        month={month}
        filter={filter}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onFilterChange={setFilter}
      />

      <CalendarGrid
        year={year}
        month={month}
        schedules={schedules}
        selectedDate={selectedDate}
        onDateClick={handleDateClick}
      />

      {isFormOpen ? (
        <ScheduleFormModal
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleCreateSchedule}
          selectedDate={selectedDate}
          loading={loading}
        />
      ) : viewingSchedule ? (
        <ScheduleDetailPanel
          schedule={viewingSchedule}
          onClose={handleCloseDetail}
          onSave={handleUpdateSchedule}
          onDelete={handleDeleteDetail}
          loading={loading}
        />
      ) : (
        <div className="space-y-3">
          <TodayScheduleList
            date={displayDateLabel}
            schedules={selectedDaySchedules}
            onScheduleClick={handleCardClick}
            onAddClick={handleOpenForm}
            addDisabled={loading}
          />
        </div>
      )}
      </div>
    </>
  );
}

function parseLongOrNull(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getAuthUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);

    // 로그인 PK는 숫자 id만 사용 (userId는 로그인 문자열이라 createdUserId로 쓰면 안 됨)
    const id = parseLongOrNull(user?.id ?? user?.data?.id);
    const facilityId = parseLongOrNull(
      user?.facilityId?.facilityId ?? user?.facilityId ?? user?.data?.facilityId
    );

    return { id, facilityId };
  } catch {
    return null;
  }
}

function toLocalDateTimeString(dateStr, timeStr) {
  const d = String(dateStr).slice(0, 10);
  const t = timeStr ? String(timeStr).slice(0, 5) : "09:00";
  return `${d}T${t}:00`;
}

function toCreateRequest({ facilityId, createdUserId, formData }) {
  const scheduledAt = toLocalDateTimeString(formData.startDate, formData.startTime);
  const endAt = toLocalDateTimeString(
    formData.endDate || formData.startDate,
    formData.endTime || formData.startTime
  );

  return {
    facilityId,
    createdUserId,
    patientId: null,
    title: formData.title,
    content: formData.content,
    scheduledAt,
    endAt,
  };
}

function toUpdateRequest({ facilityId, createdUserId, patientId, formData }) {
  const scheduledAt = toLocalDateTimeString(formData.startDate, formData.startTime);
  const endAt = toLocalDateTimeString(
    formData.endDate || formData.startDate,
    formData.endTime || formData.startTime
  );

  return {
    facilityId,
    createdUserId,
    patientId,
    title: formData.title,
    content: formData.content,
    scheduledAt,
    endAt,
  };
}

export default SchedulePage;
