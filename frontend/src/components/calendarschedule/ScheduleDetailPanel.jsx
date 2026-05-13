import React, { useEffect, useState } from "react";
import { toDate } from "../../utils/dateUtils";
import TwelveHourTimeSelect, { dateToSnappedTime24, formatTime24Korean } from "./TwelveHourTimeSelect";
import ButtonCalendarDatePicker from "./ButtonCalendarDatePicker";
import ScheduleFieldSection, {
  fieldInputStyle,
  fieldTextareaStyle,
  valueReadBox,
  toolbarBtn,
  toolbarBtnPrimary,
  toolbarBtnDanger,
} from "./ScheduleFieldSection";

const pad2 = (n) => String(n).padStart(2, "0");

const toDateInput = (d) =>
  d ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` : "";

const formatYmdSlash = (ymd) => {
  if (!ymd) return "—";
  const p = String(ymd).slice(0, 10).split("-");
  return p.length === 3 ? `${p[0]}/${p[1]}/${p[2]}` : ymd;
};

const ScheduleDetailPanel = ({ schedule, onClose, onSave, onDelete, loading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});

  const hydrateFromSchedule = () => {
    if (!schedule) return;
    const s = toDate(schedule.scheduledAt);
    let e = toDate(schedule.endAt) || s;
    if (s && e && e.getTime() < s.getTime()) e = s;
    setTitle(schedule.title || "");
    setStartDate(toDateInput(s));
    setEndDate(toDateInput(e));
    setStartTime(dateToSnappedTime24(s));
    setEndTime(dateToSnappedTime24(e));
    setContent(schedule.content || "");
    setErrors({});
  };

  useEffect(() => {
    hydrateFromSchedule();
    setIsEditing(false);
  }, [schedule]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "제목을 입력해주세요.";
    if (!startDate) newErrors.startDate = "시작일을 입력해주세요.";
    if (!endDate) newErrors.endDate = "종료일을 입력해주세요.";
    if (startDate && endDate && startDate > endDate) newErrors.dateRange = "시작일은 종료일보다 빠를 수 없습니다.";
    if (startDate === endDate && startTime && endTime && startTime > endTime)
      newErrors.timeRange = "시작시간은 종료시간보다 빠를 수 없습니다.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave?.({ title, startDate, endDate, startTime, endTime, content });
    }
  };

  const handleStartEdit = () => {
    hydrateFromSchedule();
    setIsEditing(true);
  };

  if (!schedule) return null;

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
          <h2 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>
            {isEditing ? "일정 수정" : "일정 상세"}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{ ...toolbarBtn, opacity: loading ? 0.6 : 1 }}
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  style={{ ...toolbarBtnPrimary, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "저장 중..." : "저장"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{ ...toolbarBtn, opacity: loading ? 0.6 : 1 }}
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.()}
                  disabled={loading}
                  style={{ ...toolbarBtnDanger, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "처리 중..." : "삭제"}
                </button>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  disabled={loading}
                  style={{ ...toolbarBtnPrimary, opacity: loading ? 0.6 : 1 }}
                >
                  수정
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <ScheduleFieldSection title="제목" footerError={isEditing ? errors.title : undefined}>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요."
                style={fieldInputStyle}
              />
            ) : (
              <p style={valueReadBox}>{title || "—"}</p>
            )}
          </ScheduleFieldSection>

          <ScheduleFieldSection title="기간" footerError={isEditing ? dateErr : undefined}>
            {isEditing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "start" }}>
                <ButtonCalendarDatePicker value={startDate} onChange={setStartDate} disabled={loading} />
                <div style={{ textAlign: "center", color: "#64748b", paddingTop: 10, fontWeight: 600 }}>~</div>
                <ButtonCalendarDatePicker value={endDate} onChange={setEndDate} disabled={loading} />
              </div>
            ) : (
              <p style={{ ...valueReadBox, margin: 0 }}>
                {formatYmdSlash(startDate)} ~ {formatYmdSlash(endDate)}
              </p>
            )}
          </ScheduleFieldSection>

          <ScheduleFieldSection title="시간" footerError={isEditing ? errors.timeRange : undefined}>
            {isEditing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "center" }}>
                <TwelveHourTimeSelect value={startTime} onChange={setStartTime} disabled={loading} />
                <div style={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>~</div>
                <TwelveHourTimeSelect value={endTime} onChange={setEndTime} disabled={loading} />
              </div>
            ) : (
              <p style={{ ...valueReadBox, margin: 0 }}>
                {startTime || endTime
                  ? `${formatTime24Korean(startTime)} ~ ${formatTime24Korean(endTime)}`
                  : "—"}
              </p>
            )}
          </ScheduleFieldSection>

          <ScheduleFieldSection title="내용">
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 작성하세요."
                style={fieldTextareaStyle}
              />
            ) : (
              <p style={{ ...valueReadBox, minHeight: 100 }}>{content?.trim() ? content : "내용 없음"}</p>
            )}
          </ScheduleFieldSection>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailPanel;
