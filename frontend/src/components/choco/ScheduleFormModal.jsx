import React, { useState, useEffect } from "react";
import TwelveHourTimeSelect from "./TwelveHourTimeSelect";
import ButtonCalendarDatePicker from "./ButtonCalendarDatePicker";
import ScheduleFieldSection, {
  fieldInputStyle,
  fieldTextareaStyle,
  toolbarBtn,
  toolbarBtnPrimary,
} from "./ScheduleFieldSection";

const ScheduleFormModal = ({ isOpen, onClose, onSubmit, selectedDate, loading = false }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedDate) {
      setStartDate(String(selectedDate).slice(0, 10));
      setEndDate(String(selectedDate).slice(0, 10));
    }
  }, [selectedDate]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "제목을 입력해주세요.";
    if (!startDate) newErrors.startDate = "시작일을 입력해주세요.";
    if (!endDate) newErrors.endDate = "종료일을 입력해주세요.";
    if (startDate && endDate && startDate > endDate)
      newErrors.dateRange = "시작일은 종료일보다 빠를 수 없습니다.";
    if (startDate === endDate && startTime && endTime && startTime > endTime)
      newErrors.timeRange = "시작시간은 종료시간보다 빠를 수 없습니다.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit?.({ title, startDate, endDate, startTime, endTime, content });
    }
  };

  if (!isOpen) return null;

  const dateErr =
    errors.startDate || errors.endDate || errors.dateRange || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        background: "#f1f5f9",
        padding: 20,
        boxShadow: "0 4px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 18,
            paddingBottom: 16,
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>일정 추가</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ ...toolbarBtn, opacity: loading ? 0.6 : 1 }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...toolbarBtnPrimary, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <ScheduleFieldSection title="제목" footerError={errors.title}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요."
              style={fieldInputStyle}
            />
          </ScheduleFieldSection>

          <ScheduleFieldSection title="기간" footerError={dateErr}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "start" }}>
              <ButtonCalendarDatePicker value={startDate} onChange={setStartDate} disabled={loading} />
              <div style={{ textAlign: "center", color: "#64748b", paddingTop: 10, fontWeight: 600 }}>~</div>
              <ButtonCalendarDatePicker value={endDate} onChange={setEndDate} disabled={loading} />
            </div>
          </ScheduleFieldSection>

          <ScheduleFieldSection title="시간" footerError={errors.timeRange}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "center" }}>
              <TwelveHourTimeSelect value={startTime} onChange={setStartTime} disabled={loading} />
              <div style={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>~</div>
              <TwelveHourTimeSelect value={endTime} onChange={setEndTime} disabled={loading} />
            </div>
          </ScheduleFieldSection>

          <ScheduleFieldSection title="내용">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 작성하세요."
              style={fieldTextareaStyle}
            />
          </ScheduleFieldSection>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFormModal;
