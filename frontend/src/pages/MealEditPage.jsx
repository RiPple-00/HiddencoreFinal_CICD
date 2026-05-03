import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const menuItems = [
  { id: "dashboard", label: "대시보드", icon: "" },
  { id: "patients", label: "환자 기록", icon: "" },
  { id: "meal", label: "식단 관리", icon: "" },
  { id: "inventory", label: "재고 관리", icon: "" },
  { id: "analytics", label: "통계 분석", icon: "" },
];

const navTabs = ["개요", "식단 관리", "환자 목록"];
const dietOptions = ["일반식", "저염식", "금식"];
const reasonOptions = ["재료 소진", "영양 조정", "알레르기", "의사 지시", "기타"];

export default function MealPlanner() {
  const { date } = useParams();
  const location = useLocation();
  const selectedDate = location.state?.selectedDate || date || "";
  const [activeNav, setActiveNav] = useState("식단 관리");
  const [activeMenu, setActiveMenu] = useState("meal");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("재료 소진");
  const [diet, setDiet] = useState("일반식");
  const [detail, setDetail] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Noto Sans KR', sans-serif", background: "#f0f4f8" }}>
      {/* Top Nav */}
      <header style={{
        display: "flex", alignItems: "center", background: "#fff",
        borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: 56, gap: 24, flexShrink: 0
      }}>
        <nav style={{ display: "flex", gap: 0 }}>
          {navTabs.map(tab => (
            <button key={tab} onClick={() => setActiveNav(tab)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0 18px", height: 56, fontWeight: activeNav === tab ? 700 : 400,
              color: activeNav === tab ? "#1e40af" : "#64748b",
              borderBottom: activeNav === tab ? "2px solid #1e40af" : "2px solid transparent",
              fontSize: 14, transition: "all 0.15s"
            }}>{tab}</button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{
          display: "flex", alignItems: "center", background: "#f1f5f9",
          borderRadius: 8, padding: "6px 14px", gap: 8, width: 220
        }}>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>🔍</span>
          <input placeholder="환자 검색..." style={{
            border: "none", background: "none", outline: "none",
            fontSize: 13, color: "#334155", width: "100%"
          }} />
        </div>
        {["🔔", "⚙", "❓"].map((icon, i) => (
          <button key={i} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}>{icon}</button>
        ))}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "#fbbf24",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
        }}>-</div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside style={{
          width: 190, background: "#fff", borderRight: "1px solid #e2e8f0",
          display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0
        }}>
          <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: "#1e40af",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16
              }}>🏥</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1e3a8a" }}>메인 클리닉</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>영양식이팀</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "12px 0", flex: 1 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, padding: "0 16px 8px", letterSpacing: "0.1em" }}>메뉴</div>
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveMenu(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", background: activeMenu === item.id ? "#eff6ff" : "none",
                border: "none", cursor: "pointer", textAlign: "left",
                color: activeMenu === item.id ? "#1e40af" : "#64748b",
                fontWeight: activeMenu === item.id ? 700 : 400,
                fontSize: 13, borderLeft: activeMenu === item.id ? "3px solid #1e40af" : "3px solid transparent",
                transition: "all 0.15s"
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "16px" }}>
            <button style={{
              width: "100%", background: "#1e40af", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 12,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
              ⬆ 식단 업로드
            </button>
            <button style={{
              width: "100%", marginTop: 8, background: "none", color: "#94a3b8", border: "none",
              fontSize: 12, cursor: "pointer", textAlign: "left", padding: "6px 0"
            }}>↪ 로그아웃</button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                {selectedDate ? `${selectedDate} 식단 수정 상세 설정` : "식단 수정 상세 설정"}
              </h1>
              <span style={{
                background: "#dbeafe", color: "#1e40af", fontSize: 11,
                fontWeight: 700, padding: "2px 10px", borderRadius: 20
              }}>관리자 모드</span>
            </div>
            <p style={{ color: "#475569", fontSize: 14, margin: "0 0 8px" }}>
              {selectedDate
                ? `${selectedDate}에 대한 식단을 수정할 수 있습니다.`
                : "캘린더에서 날짜를 선택하면 해당 날짜의 식단 수정 화면이 나타납니다."
              }
            </p>
            {selectedDate && (
              <div style={{ display: "inline-block", padding: "8px 14px", background: "#eef2ff", color: "#3730a3", borderRadius: 9999, fontSize: 13 }}>
                선택한 날짜: {selectedDate}
              </div>
            )}
          </div>

          <div style={{
            background: "#fff", borderRadius: 16, padding: "28px 32px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)", maxWidth: 700, margin: "0 auto"
          }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, color: "#94a3b8", fontSize: 13 }}>
              <span>✏️</span> 식단 정보 입력
            </div>

            {/* 제목 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>제목</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 2024년 5월 고혈압 환자 저염식 수정안"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 8,
                  border: "1px solid #e2e8f0", fontSize: 13, color: "#334155",
                  outline: "none", boxSizing: "border-box", background: "#f8fafc",
                  transition: "border 0.15s"
                }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* 수정 사유 + 식단 선택 */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>수정 사유</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 36px 11px 14px", borderRadius: 8,
                      border: "1px solid #e2e8f0", fontSize: 13, color: "#334155",
                      background: "#f8fafc", outline: "none", appearance: "none", cursor: "pointer"
                    }}
                  >
                    {reasonOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>▾</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>식단 선택</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {dietOptions.map(opt => (
                    <button key={opt} onClick={() => setDiet(opt)} style={{
                      padding: "9px 16px", borderRadius: 20, border: "none",
                      cursor: "pointer", fontSize: 13, fontWeight: diet === opt ? 700 : 500,
                      background: diet === opt ? "#1e40af" : "#f1f5f9",
                      color: diet === opt ? "#fff" : "#64748b",
                      transition: "all 0.15s"
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 세부 변경 내용 */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>세부 변경 내용</label>
              <textarea
                value={detail}
                onChange={e => setDetail(e.target.value)}
                placeholder="식단 조정 사유 및 구체적인 영양 성분 변경 내용을 입력하세요..."
                rows={6}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 8,
                  border: "1px solid #e2e8f0", fontSize: 13, color: "#334155",
                  background: "#f8fafc", outline: "none", resize: "vertical",
                  fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box"
                }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button style={{
                padding: "11px 24px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#64748b", fontWeight: 600,
                fontSize: 14, cursor: "pointer"
              }}>취소</button>
              <button style={{
                padding: "11px 28px", borderRadius: 8, border: "none",
                background: "#1e40af", color: "#fff", fontWeight: 700,
                fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,64,175,0.25)"
              }}>수정 완료</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
