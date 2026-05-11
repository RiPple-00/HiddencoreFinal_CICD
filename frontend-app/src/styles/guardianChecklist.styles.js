import { StyleSheet } from "react-native";

const C = {
  bg: "#FAF6EE",
  bgDeep: "#F5EFE2",
  white: "#FFFFFF",
  border: "rgba(0,0,0,0.06)",
  borderLight: "rgba(0,0,0,0.08)",
  modalOverlay: "rgba(0,0,0,0.45)",

  text900: "#2C2C2A",
  text500: "#5F5E5A",
  text400: "#888780",
  text300: "#B4B2A9",

  coral500: "#D85A30",
  coral600: "#BA4824",
  coral700: "#993C1D",
  coral800: "#712B13",
  coral100: "#FAEEDA",

  amber600: "#BA7517",
  rose500: "#E24B4A",

  normalBg: "#C8E6A2",
  normalText: "#3B6D11",
  warnBg: "#FAEEDA",
  warnText: "#854F0B",
  dangerBg: "#FFB8B8",
  dangerText: "#A32D2D",
};

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },

  /* 헤더 */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoIcon: { fontSize: 17, color: C.coral500 },
  logoText: { fontSize: 15, fontWeight: "500", color: C.coral700 },
  headerIcons: { flexDirection: "row", gap: 14 },
  iconText: { fontSize: 18, color: C.text500 },

  /* 인사말 */
  greeting: { paddingHorizontal: 18, paddingBottom: 14 },
  greetingTitle: { fontSize: 17, fontWeight: "500", color: C.text900, marginBottom: 4 },
  greetingHeart: { color: C.rose500 },
  greetingSub: { fontSize: 11.5, color: C.text500 },

  /* 스크롤 영역 */
  scrollContent: { paddingHorizontal: 14, paddingBottom: 80 },

  /* 카드 공통 */
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 12,
  },

  /* 오늘 체크 현황 카드 */
  statusCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 12,
  },
  statusCardTitle: { fontSize: 13, fontWeight: "500", color: C.text900 },
  statusCardDate: { fontSize: 10, color: C.text300, marginBottom: 14 },
  statusCardBody: { flexDirection: "row", alignItems: "center", gap: 16 },
  statusCardStats: { flex: 1 },
  statusSummaryText: { fontSize: 11.5, color: C.text500, marginBottom: 10 },
  statusSummaryBold: { color: C.text900, fontWeight: "500" },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontSize: 11, color: C.text500 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotNormal: { backgroundColor: C.normalText },
  dotWarn: { backgroundColor: C.amber600 },
  dotDanger: { backgroundColor: C.rose500 },

  /* 진행률 링 */
  ring: { position: "relative" },
  ringText: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercent: { fontSize: 17, fontWeight: "500", color: C.coral500 },
  ringLabel: { fontSize: 9, color: C.text500, marginTop: 2 },

  /* 필터 탭 */
  filterTabs: { paddingVertical: 4, paddingBottom: 12, gap: 6 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 0.5,
    borderColor: C.borderLight,
  },
  filterTabActive: { backgroundColor: C.coral100, borderColor: "transparent" },
  filterTabText: { fontSize: 11.5, color: C.text500 },
  filterTabTextActive: { color: C.coral800, fontWeight: "500" },

  /* 섹션 헤더 */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  sectionNum: {
    width: 22, height: 22,
    backgroundColor: C.coral100,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionNumText: { fontSize: 11, fontWeight: "500", color: C.amber600 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { flex: 1, fontSize: 13.5, fontWeight: "500", color: C.text900 },
  sectionTime: { fontSize: 9.5, color: C.text300, textAlign: "right" },

  /* 그리드 헤더 (아침/점심/저녁) */
  gridColHeader: { flexDirection: "row", paddingBottom: 8 },
  gridColHeaderText: { flex: 1, fontSize: 10, color: C.text500 },
  gridColHeaderTextCenter: { fontSize: 10, color: C.text500, textAlign: "center" },

  /* 그리드 행 */
  gridRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  gridRowLabel: { flex: 1 },
  gridCell: { width: 38, paddingHorizontal: 2 },

  /* 단일 상태 행 */
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 11.5, color: C.text900 },

  /* 메타값 (배뇨/배변) */
  metaRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { fontSize: 11, color: C.text500 },

  /* 상태 핀 */
  pill: {
    borderRadius: 10,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  pillFull: { paddingHorizontal: 12 },
  pillNormal: { backgroundColor: C.normalBg },
  pillWarn: { backgroundColor: C.warnBg },
  pillDanger: { backgroundColor: C.dangerBg },
  pillEmpty: { backgroundColor: "#E8E6E0" },
  pillText: { fontSize: 10, fontWeight: "500" },
  pillTextNormal: { color: C.normalText },
  pillTextWarn: { color: C.warnText },
  pillTextDanger: { color: C.dangerText },
  pillTextEmpty: { color: C.text400 },

  specialNotesReadonly: {
    fontSize: 12,
    lineHeight: 19,
    color: C.text900,
    paddingVertical: 4,
  },

  /* 모달 */
  modalOverlay: {
    flex: 1,
    backgroundColor: C.modalOverlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  modalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 13.5, fontWeight: "500", color: C.text900 },
  modalCloseIcon: { fontSize: 22, color: C.text500 },
  modalItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  modalItemIcon: { fontSize: 15 },
  modalItemName: { flex: 1, fontSize: 12.5, fontWeight: "500", color: C.text900 },
  modalDesc: {
    fontSize: 11.5,
    lineHeight: 19,
    color: C.text900,
    backgroundColor: C.bgDeep,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  modalConfirm: {
    backgroundColor: "#F4C77A",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalConfirmText: { color: C.white, fontSize: 13, fontWeight: "600" },

  /* 하단 네비게이션 */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: C.white,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  bottomItem: { alignItems: "center", gap: 3, flex: 1 },
  bottomActiveBg: {
    backgroundColor: C.coral100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: -3,
  },
  bottomIcon: { fontSize: 19 },
  bottomLabel: { fontSize: 9.5, color: C.text500 },
  bottomLabelActive: { color: C.coral500, fontWeight: "500" },
});
