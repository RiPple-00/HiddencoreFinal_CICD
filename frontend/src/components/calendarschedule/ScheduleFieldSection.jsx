import React from "react";

/** 일정 추가/상세 폼에서 제목·기간·시간·내용 구역 구분 */
// 사실상 css

export default function ScheduleFieldSection({ title, children, footerError }) {
  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "16px 18px",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: 13,
          fontWeight: 700,
          color: "#1e40af",
          letterSpacing: "-0.02em",
          paddingBottom: 8,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {title}
      </h3>
      <div>{children}</div>
      {footerError ? (
        <p style={{ color: "#dc2626", margin: "10px 0 0", fontSize: 13 }}>{footerError}</p>
      ) : null}
    </section>
  );
}

export const fieldInputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  background: "#fff",
};

export const fieldTextareaStyle = {
  ...fieldInputStyle,
  minHeight: 140,
  resize: "vertical",
  fontFamily: "inherit",
  lineHeight: 1.55,
};

export const valueReadBox = {
  margin: 0,
  padding: "12px 14px",
  background: "#f8fafc",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  minHeight: 22,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: 15,
  color: "#0f172a",
  lineHeight: 1.55,
};

export const toolbarBtn = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

export const toolbarBtnPrimary = {
  ...toolbarBtn,
  background: "#2563eb",
  color: "#fff",
  borderColor: "#2563eb",
};

export const toolbarBtnDanger = {
  ...toolbarBtn,
  background: "#fff",
  color: "#b91c1c",
  borderColor: "#fecaca",
};
