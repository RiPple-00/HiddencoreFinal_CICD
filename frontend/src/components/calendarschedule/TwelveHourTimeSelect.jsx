import React from "react";

// 시간 선택 로직

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const snapToStep5 = (m) => {
  const n = Number(m);
  if (Number.isNaN(n)) return 0;
  return Math.min(55, Math.max(0, Math.round(n / 5) * 5));
};

/** "HH:mm" → { hour12, minute, ampm } 또는 null */
export function parseTime24ToParts(t) {
  if (t == null || String(t).trim() === "") return null;
  const s = String(t).slice(0, 5);
  const [hs, ms] = s.split(":");
  const h24 = parseInt(hs, 10);
  if (Number.isNaN(h24) || h24 < 0 || h24 > 23) return null;
  let minute = parseInt(ms, 10);
  if (Number.isNaN(minute)) minute = 0;
  minute = snapToStep5(minute);
  const ampm = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, ampm };
}

/** 12시 표기 + 오전/오후 → "HH:mm" (24h) */
export function partsToTime24(hour12, minute, ampm) {
  const h = Number(hour12);
  const m = snapToStep5(minute);
  let h24;
  if (h === 12) {
    h24 = ampm === "AM" ? 0 : 12;
  } else {
    h24 = h + (ampm === "PM" ? 12 : 0);
  }
  return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function dateToSnappedTime24(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const h24 = d.getHours();
  const minute = snapToStep5(d.getMinutes());
  const ampm = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return partsToTime24(hour12, minute, ampm);
}

export function formatTime24Korean(hhmm) {
  const p = parseTime24ToParts(hhmm);
  if (!p) return "—";
  const ap = p.ampm === "AM" ? "오전" : "오후";
  return `${ap} ${p.hour12}:${String(p.minute).padStart(2, "0")}`;
}

/**
 * 시 1–12, 분 0–55(5분 단위), 오전/오후 — select만 사용해 범위 밖으로 스크롤되지 않음
 */
const TwelveHourTimeSelect = ({ value, onChange, disabled = false }) => {
  const display = parseTime24ToParts(value) ?? { hour12: 9, minute: 0, ampm: "AM" };

  const update = (patch) => {
    const next = { ...display, ...patch };
    const minute = MINUTES.includes(next.minute) ? next.minute : snapToStep5(next.minute);
    onChange?.(partsToTime24(next.hour12, minute, next.ampm));
  };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <select
        aria-label="오전/오후"
        value={display.ampm}
        onChange={(e) => update({ ampm: e.target.value })}
        disabled={disabled}
        style={{ minWidth: 72, padding: "6px 8px" }}
      >
        <option value="AM">오전</option>
        <option value="PM">오후</option>
      </select>
      <select
        aria-label="시 (12시간)"
        value={display.hour12}
        onChange={(e) => update({ hour12: Number(e.target.value) })}
        disabled={disabled}
        style={{ minWidth: 72, padding: "6px 8px" }}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}시
          </option>
        ))}
      </select>
      <select
        aria-label="분 (5분 단위)"
        value={display.minute}
        onChange={(e) => update({ minute: Number(e.target.value) })}
        disabled={disabled}
        style={{ minWidth: 72, padding: "6px 8px" }}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}분
          </option>
        ))}
      </select>
    </div>
  );
};

export default TwelveHourTimeSelect;
