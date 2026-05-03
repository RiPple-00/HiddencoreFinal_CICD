import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateCalendar, isSameDay } from "../../utils/calendarUtils";

// 기간 선택 컴포넌트

const pad2 = (n) => String(n).padStart(2, "0");

const toYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const parseYmdToLocalDate = (s) => {
  if (!s || String(s).length < 10) return new Date();
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};

const formatSlash = (ymd) => {
  if (!ymd || String(ymd).length < 10) return "날짜 선택";
  const [y, m, d] = String(ymd).slice(0, 10).split("-");
  return `${y}/${m}/${d}`;
};

/**
 * 네이티브 date input(스크롤 휠) 대신, 월은 상단 버튼(&lt; &gt;)으로만 바꾸는 달력 팝오버
 */
const ButtonCalendarDatePicker = ({ value, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const [panel, setPanel] = useState(() => {
    const d = parseYmdToLocalDate(value);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  useEffect(() => {
    if (open) {
      const d = parseYmdToLocalDate(value);
      setPanel({ y: d.getFullYear(), m: d.getMonth() });
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const panelBase = useMemo(() => new Date(panel.y, panel.m, 1), [panel.y, panel.m]);
  const weeks = useMemo(() => generateCalendar(panelBase), [panelBase]);

  const goPrevMonth = () => {
    setPanel((p) => (p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 }));
  };

  const goNextMonth = () => {
    setPanel((p) => (p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 }));
  };

  const pickDay = (date) => {
    onChange?.(toYmd(date));
    setOpen(false);
  };

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          style={{
            flex: 1,
            textAlign: "left",
            padding: "8px 10px",
            border: "1px solid #ccc",
            borderRadius: 8,
            background: "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {formatSlash(value)}
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-label="달력에서 날짜 선택"
          onClick={() => !disabled && setOpen((o) => !o)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 8,
            background: "#f9fafb",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          📅
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label="날짜 선택"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 6,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            padding: 12,
            minWidth: 280,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={goPrevMonth}
              style={{
                minWidth: 36,
                padding: "6px 0",
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fff",
                cursor: "pointer",
              }}
              aria-label="이전 달"
            >
              {"<"}
            </button>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              {panel.y}년 {panel.m + 1}월
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              style={{
                minWidth: 36,
                padding: "6px 0",
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fff",
                cursor: "pointer",
              }}
              aria-label="다음 달"
            >
              {">"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
              textAlign: "center",
              fontSize: 11,
              color: "#6b7280",
              marginBottom: 4,
            }}
          >
            {weekdays.map((w) => (
              <div key={w} style={{ padding: "4px 0" }}>
                {w}
              </div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div
              key={wi}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 2,
              }}
            >
              {week.map((date, di) => {
                const inMonth = date.getMonth() === panel.m;
                const selected =
                  value &&
                  String(value).length >= 10 &&
                  isSameDay(date, parseYmdToLocalDate(value));
                return (
                  <button
                    key={`${wi}-${di}`}
                    type="button"
                    onClick={() => pickDay(date)}
                    style={{
                      padding: "8px 0",
                      border: selected ? "2px solid #2563eb" : "1px solid transparent",
                      borderRadius: 8,
                      background: selected ? "#eff6ff" : "transparent",
                      color: inMonth ? "#111" : "#c4c4c4",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: selected ? 700 : 400,
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ButtonCalendarDatePicker;
