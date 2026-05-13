import { StyleSheet } from "react-native";
import { G, GMuted, GMutedLight, GBorder, GInkSoft } from "./guardianTheme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.bgSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
    backgroundColor: G.backgroundNeutral,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: G.textPrimary,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: GMuted,
  },

  programSectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: G.backgroundNeutral,
  },
  programSectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: GInkSoft,
  },
  programSectionSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: GMuted,
  },

  tokenWarningBox: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  tokenWarningText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    lineHeight: 19,
  },

  tabRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: G.backgroundNeutral,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: G.buttonSecondary,
  },
  tabButtonActive: {
    backgroundColor: G.buttonPrimary,
  },
  tabText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: GMuted,
  },
  tabTextActive: {
    color: G.textPrimary,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: GMuted,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: GMutedLight,
  },

  programCard: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: G.buttonSecondary,
  },
  statusBadgeActive: {
    backgroundColor: G.successSecondary,
  },
  statusBadgeUpcoming: {
    backgroundColor: "#FFF7E6",
  },
  statusBadgeClosed: {
    backgroundColor: G.bgSecondary,
  },
  statusBadgeDefault: {
    backgroundColor: G.buttonSecondary,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: G.textPrimary,
  },
  statusBadgeTextActive: {
    color: G.successPrimary,
  },
  statusBadgeTextUpcoming: {
    color: "#D97706",
  },
  statusBadgeTextClosed: {
    color: GMuted,
  },
  statusBadgeTextDefault: {
    color: G.textPrimary,
  },

  programDate: {
    fontSize: 12,
    fontWeight: "700",
    color: GMuted,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GInkSoft,
  },
  programContent: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: GMuted,
  },

  detailBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: G.bgSecondary,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: GMuted,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    color: GInkSoft,
  },

  infoRow: {
    marginTop: 14,
    marginBottom: 14,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "700",
    color: GMuted,
  },

  applyButton: {
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: G.buttonPrimary,
  },
  applyButtonDisabled: {
    backgroundColor: GBorder,
  },
  applyButtonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: G.textPrimary,
  },
  applyButtonTextDisabled: {
    color: GMutedLight,
  },

  historyCard: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: GBorder,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: GInkSoft,
    marginBottom: 10,
  },
  historyInfo: {
    fontSize: 14,
    lineHeight: 21,
    color: GMuted,
  },
  historyBottomRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GBorder,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: "800",
    color: G.textSecondary,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: "700",
    color: GMutedLight,
  },

  cancelButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: G.errorSecondary,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelButtonDisabled: {
    backgroundColor: G.bgSecondary,
    borderColor: GBorder,
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
    color: G.errorPrimary,
  },
  cancelButtonTextDisabled: {
    color: GMutedLight,
  },

  filterScroll: {
    marginBottom: 14,
  },
  filterRow: {
    gap: 8,
    paddingRight: 4,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: G.backgroundNeutral,
    borderWidth: 1,
    borderColor: GBorder,
  },
  filterButtonActive: {
    backgroundColor: G.buttonPrimary,
    borderColor: G.buttonPrimary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: GMuted,
  },
  filterButtonTextActive: {
    color: G.textPrimary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(80, 49, 21, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  confirmModal: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: G.backgroundNeutral,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: G.buttonSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalIcon: {
    fontSize: 26,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: G.textPrimary,
    marginBottom: 10,
  },
  modalProgramTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: GInkSoft,
    textAlign: "center",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: GMuted,
    textAlign: "center",
    marginBottom: 22,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
  },
  modalCancelButton: {
    backgroundColor: G.buttonSecondary,
  },
  modalConfirmButton: {
    backgroundColor: G.buttonPrimary,
  },
  modalDangerButton: {
    backgroundColor: G.errorPrimary,
  },
  modalCancelText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: GMuted,
  },
  modalConfirmText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: G.textPrimary,
  },
  modalDangerText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: G.backgroundNeutral,
  },
});
