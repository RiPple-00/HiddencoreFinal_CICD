// 이전/다음 달 이동 + 필터 버튼
const CalendarHeader = ({
  year,
  month,
  filter = "ALL",
  onPrevMonth,
  onNextMonth,
  onFilterChange,
}) => {
  const buttonStyle = (active) => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: active ? "#ffedd5" : "#fff",
    fontWeight: active ? 700 : 400,
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" onClick={onPrevMonth} style={buttonStyle(false)}>
          이전
        </button>
        <h2 style={{ margin: 0, minWidth: 140, textAlign: "center" }}>
          {year}년 {month}월
        </h2>
        <button type="button" onClick={onNextMonth} style={buttonStyle(false)}>
          다음
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onFilterChange?.("ALL")}
          style={buttonStyle(filter === "ALL")}
        >
          전체
        </button>
        <button
          type="button"
          onClick={() => onFilterChange?.("PROGRAM")}
          style={buttonStyle(filter === "PROGRAM")}
        >
          프로그램
        </button>
        <button
          type="button"
          onClick={() => onFilterChange?.("PERSONAL")}
          style={buttonStyle(filter === "PERSONAL")}
        >
          개인
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;