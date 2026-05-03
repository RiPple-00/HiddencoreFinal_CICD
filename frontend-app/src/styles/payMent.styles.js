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

  summaryHeader: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20,
    marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  summaryHeaderLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  summaryHeaderAmount: { fontSize: 32, fontWeight: "700", color: COLORS.textPrimary },

  filterBar: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    zIndex: 50,
  },
  filterButton: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  filterButtonActive: { backgroundColor: COLORS.blue50 },
  filterButtonText: { fontSize: 12, fontWeight: "500", color: COLORS.textMuted },
  filterButtonTextActive: { color: COLORS.blue600 },

  dropdownBox: {
    position: "absolute",
    top: 36, left: 0,
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: 12,
    minWidth: 150,
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
  dateGroup: { marginBottom: 16 },
  dateLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dateLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textLight },
  dateLine: { flex: 1, height: 1, backgroundColor: COLORS.borderNormal, marginLeft: 8 },

  smallCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.borderLight,
    padding: 16,
    marginBottom: 8,
  },
  smallCardTopRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 4,
  },
  smallCardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  smallCardAmount: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  smallCardBottomRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  smallCardTime: { fontSize: 11, color: COLORS.textLight },
  doneBadge: {
    marginLeft: "auto",
    backgroundColor: COLORS.green50,
    borderWidth: 1, borderColor: COLORS.green200,
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 6,
  },
  doneBadgeText: { fontSize: 11, color: COLORS.green600, fontWeight: "600" },
  smallCardTagRow: { marginTop: 10, alignSelf: "flex-start" },

  bigCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.borderLight,
    paddingHorizontal: 16, paddingVertical: 16,
    marginBottom: 12,
  },
  bigCardStatusRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },
  bigCardDate: { fontSize: 11, color: COLORS.textLight, marginLeft: 8 },
  bigCardLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 2 },
  bigCardAmount: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12 },
  bigCardAmountRed: { color: COLORS.red400 },
  bigCardTagPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  bigCardTagText: { fontSize: 11, fontWeight: "600" },

  tagBadgeSmall: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  tagBadgeSmallText: { fontSize: 11, fontWeight: "500" },

  emptyBox: { alignItems: "center", paddingVertical: 64 },
  emptyText: { fontSize: 14, color: COLORS.textLight },
  errorText: { fontSize: 14, color: COLORS.red400 },
});