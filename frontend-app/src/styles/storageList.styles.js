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
  headerRight: { width: 30 },

  patientBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  patientAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.blue200,
    alignItems: "center", justifyContent: "center",
    marginRight: 10,
  },
  patientAvatarText: { fontSize: 12, fontWeight: "600", color: COLORS.blue700 },
  patientInfo: { flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  patientName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  patientStatus: { fontSize: 12, color: COLORS.textLight, marginLeft: 4 },
  patientMeta: { fontSize: 11, color: COLORS.textLight, marginLeft: 8 },

  filterBar: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    zIndex: 50,
  },
  filterButton: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  filterButtonActive: { backgroundColor: COLORS.blue50 },
  filterButtonText: { fontSize: 12, fontWeight: "500", color: COLORS.textMuted },
  filterButtonTextActive: { color: COLORS.blue600 },
  filterIcon: { marginRight: 6, fontSize: 12 },

  pickerBox: {
    position: "absolute",
    top: 36, left: 0,
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: 12,
    width: 260,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 100,
  },
  yearNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  yearNavButton: {
    width: 28, height: 28, borderRadius: 6,
    alignItems: "center", justifyContent: "center",
  },
  yearNavArrow: { fontSize: 14, color: COLORS.textMuted, fontWeight: "600" },
  yearLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },

  monthGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12 },
  monthCell: { width: "33.33%", padding: 4 },
  monthButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  monthButtonSelected: { backgroundColor: COLORS.blue600 },
  monthText: { fontSize: 13, color: COLORS.textPrimary },
  monthTextHasInvoice: { color: COLORS.textPrimary },
  monthTextEmpty: { color: COLORS.textPale },
  monthTextSelected: { color: COLORS.bgWhite, fontWeight: "600" },
  monthDot: {
    position: "absolute", bottom: 4,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: COLORS.blue500,
  },

  clearButton: {
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  clearButtonActive: { backgroundColor: COLORS.blue50 },
  clearButtonText: { fontSize: 13, color: COLORS.blue600, fontWeight: "500" },

  dropdownBox: {
    position: "absolute",
    top: 36, left: 0,
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: 12,
    minWidth: 120,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: COLORS.blue50 },
  dropdownItemText: { fontSize: 14, color: "#374151" },
  dropdownItemTextActive: { color: COLORS.blue600, fontWeight: "600" },

  summaryRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: COLORS.bgGray,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  summaryCount: { fontSize: 12, color: COLORS.textLight },
  summaryAmount: { fontSize: 12, color: COLORS.textSecondary },
  summaryAmountBold: { color: COLORS.textPrimary, fontWeight: "700" },

  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  invoiceCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.borderLight,
    padding: 16,
    marginBottom: 8,
  },
  invoiceMonth: { fontSize: 12, fontWeight: "600", color: COLORS.blue500, marginBottom: 6 },
  invoiceTitleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 8,
  },
  invoiceTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, flex: 1, marginRight: 8 },

  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },

  invoiceDateRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  invoiceDate: { fontSize: 11, color: COLORS.textLight },
  invoiceDateRed: { color: COLORS.red500, fontWeight: "600" },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 10 },
  tagBadge: {
    backgroundColor: COLORS.blue50,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: { fontSize: 11, color: COLORS.blue600, fontWeight: "500" },

  invoiceAmount: {
    fontSize: 16, fontWeight: "600", color: COLORS.textPrimary,
    textAlign: "right",
  },

  emptyBox: { alignItems: "center", paddingVertical: 64 },
  emptyText: { fontSize: 14, color: COLORS.textLight },
  emptyAction: { marginTop: 12, fontSize: 12, color: COLORS.blue500, fontWeight: "500" },
  errorText: { fontSize: 14, color: COLORS.red400 },
});