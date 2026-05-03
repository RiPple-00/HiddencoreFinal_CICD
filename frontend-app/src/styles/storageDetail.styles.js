import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgGray },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  backButton: { padding: 4 },
  backIcon: { fontSize: 22, color: COLORS.textMuted, fontWeight: "600" },
  headerTitle: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary },
  printButton: { padding: 4 },
  printIcon: { fontSize: 18 },
  printIconDisabled: { opacity: 0.4 },

  scrollContent: { paddingHorizontal: 16, paddingVertical: 16 },

  paymentSummary: {
    backgroundColor: COLORS.blue50,
    borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  paymentSummaryLabel: { fontSize: 11, color: COLORS.blue400, marginBottom: 2 },
  paymentSummaryTitle: { fontSize: 14, fontWeight: "600", color: COLORS.blue700 },
  paymentSummaryDate: { fontSize: 11, color: COLORS.blue500, marginTop: 2 },
  paymentSummaryAmount: { fontSize: 16, fontWeight: "700", color: COLORS.blue700 },

  errorBox: {
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12,
    backgroundColor: COLORS.red50,
    borderWidth: 1, borderColor: COLORS.red100,
    borderRadius: 12,
  },
  errorText: { fontSize: 12, color: COLORS.red500 },

  detailCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  loadingBox: { paddingVertical: 64, alignItems: "center" },

  patientRow: { flexDirection: "row", marginBottom: 20 },
  patientAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.blue200,
    alignItems: "center", justifyContent: "center",
    marginRight: 16,
  },
  patientAvatarText: { fontSize: 16, fontWeight: "600", color: COLORS.blue700 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 2 },
  patientPeriod: { fontSize: 12, color: COLORS.textLight, marginBottom: 8 },
  deptBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.blue50,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  deptBadgeText: { fontSize: 12, fontWeight: "500", color: COLORS.blue600 },

  section: {
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
    paddingTop: 16,
  },
  sectionTopMargin: { marginTop: 8 },

  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  sectionDotBlue: { backgroundColor: COLORS.blue600 },
  sectionDotGray: { backgroundColor: "#d1d5db" },
  sectionLabel: { fontSize: 14, fontWeight: "600" },
  sectionLabelBlue: { color: COLORS.blue600 },
  sectionLabelGray: { color: COLORS.textLight },

  feeRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "#f9fafb",
  },
  feeRowLast: { borderBottomWidth: 0 },
  feeName: { fontSize: 14, color: COLORS.textMuted },
  feeAmount: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },

  totalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
    paddingTop: 16, marginTop: 8,
  },
  totalLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  totalAmount: { fontSize: 16, fontWeight: "700", color: COLORS.blue600 },

  noItemsBox: {
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
    paddingTop: 24, paddingBottom: 8,
    alignItems: "center",
  },
  noItemsText: { fontSize: 12, color: COLORS.textLight },

  noticeBox: { paddingBottom: 24 },
  noticeText: { fontSize: 11, color: COLORS.textLight, lineHeight: 18 },
});