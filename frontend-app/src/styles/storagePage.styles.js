import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgGray },
  scrollContent: { paddingBottom: 20 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  backButton: { width: 40, height: 36, justifyContent: "center" },
  backIcon: { fontSize: 26, color: COLORS.textMuted, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  headerRightSpacer: { width: 40, height: 36 },

  topSection: {
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20,
    marginBottom: 8,
  },
  patientRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.blue50,
    borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 12,
    marginBottom: 16,
  },
  patientAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.blue200,
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  patientAvatarText: { fontSize: 14, fontWeight: "600", color: COLORS.blue700 },
  patientName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  patientMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  expectedHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 8,
  },
  expectedLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  expectedDate: { fontSize: 12, color: COLORS.textLight },

  expectedCard: {
    borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: 16, padding: 16, backgroundColor: COLORS.bgWhite,
  },
  expectedSubLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  expectedAmount: { fontSize: 28, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 12 },
  expectedAmountUnit: { fontSize: 16, fontWeight: "500", color: COLORS.textMuted },

  primaryButton: {
    backgroundColor: COLORS.blue600,
    paddingVertical: 12, borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: COLORS.bgWhite, fontSize: 14, fontWeight: "600" },

  secondaryButton: {
    backgroundColor: COLORS.bgWhite,
    borderWidth: 1, borderColor: COLORS.blue200,
    paddingVertical: 12, borderRadius: 12,
    alignItems: "center", marginTop: 8,
  },
  secondaryButtonText: { color: COLORS.blue600, fontSize: 14, fontWeight: "600" },

  errorBox: {
    marginHorizontal: 16, marginBottom: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.red50,
    borderWidth: 1, borderColor: COLORS.red100,
    borderRadius: 12,
  },
  errorText: { fontSize: 12, color: COLORS.red500 },

  pendingSection: { paddingHorizontal: 16, paddingBottom: 16 },
  pendingHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  pendingTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  pendingMore: { fontSize: 12, color: COLORS.blue500, fontWeight: "500" },

  pendingCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.borderLight,
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: "row", alignItems: "center",
    marginBottom: 8,
  },
  pendingCardLeft: { flex: 1, marginRight: 12 },
  pendingBadgeRow: { flexDirection: "row", gap: 6, marginBottom: 4 },
  pendingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pendingBadgeText: { fontSize: 11, fontWeight: "600" },
  pendingTagText: { fontSize: 11, fontWeight: "500" },
  pendingItemTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  pendingItemDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  pendingAmount: { fontSize: 14, fontWeight: "700" },

  loadingBox: { paddingVertical: 32, alignItems: "center" },
});