import { useI18n } from "../../hooks/useI18n";

const CalendarHeader = ({
  year,
  month,
  filter = "ALL",
  onPrevMonth,
  onNextMonth,
  onFilterChange,
}) => {
  const { t, language } = useI18n();

  const buttonStyle = (active) => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: active ? "#ffedd5" : "#fff",
    fontWeight: active ? 700 : 400,
  });

  const locale = language === "ko" ? "ko-KR" : language === "ja" ? "ja-JP" : "en-US";
  const monthDisplay = new Date(year, month - 1).toLocaleString(locale, {
    year: "numeric",
    month: "long",
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
          {t('calendar.prev')}
        </button>
        <h2 style={{ margin: 0, minWidth: 140, textAlign: "center" }}>
          {monthDisplay}
        </h2>
        <button type="button" onClick={onNextMonth} style={buttonStyle(false)}>
          {t('calendar.next')}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onFilterChange?.("ALL")}
          style={buttonStyle(filter === "ALL")}
        >
          {t('calendar.filter.all')}
        </button>
        <button
          type="button"
          onClick={() => onFilterChange?.("PROGRAM")}
          style={buttonStyle(filter === "PROGRAM")}
        >
          {t('calendar.filter.program')}
        </button>
        <button
          type="button"
          onClick={() => onFilterChange?.("PERSONAL")}
          style={buttonStyle(filter === "PERSONAL")}
        >
          {t('calendar.filter.personal')}
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
