import { StyleSheet } from "react-native";
import { G, GMuted, GMutedLight, GBorder, GInkSoft } from "./guardianTheme";

export const boardStyles = StyleSheet.create({
  boardTopArea: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: G.backgroundNeutral,
  },

  boardMenuRow: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 12,
  },
  boardMenuButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: G.buttonSecondary,
  },
  boardMenuButtonActive: {
    backgroundColor: G.buttonPrimary,
  },
  boardMenuText: {
    fontSize: 13,
    fontWeight: "900",
    color: GMuted,
  },
  boardMenuTextActive: {
    color: G.textPrimary,
  },

  boardSearchBox: {
    height: 46,
    borderRadius: 14,
    backgroundColor: G.bgSecondary,
    borderWidth: 1,
    borderColor: GBorder,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  boardSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: GInkSoft,
  },
  searchClearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  searchClearText: {
    fontSize: 18,
    fontWeight: "900",
    color: GMuted,
    lineHeight: 20,
  },

  writeButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: G.buttonPrimary,
  },
  writeButtonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: G.textPrimary,
  },

  /** 목록 스크롤 — 상단 검색 영역(20)과 동일한 가로 패딩 */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  boardSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    /** postCard padding(18)과 동일 — 아래 제목 첫 글자·조회수 끝과 수직 정렬 */
    paddingHorizontal: 18,
  },
  boardSectionTitle: {
    flex: 1,
    marginRight: 10,
    fontSize: 18,
    fontWeight: "900",
    color: GInkSoft,
  },
  boardSectionCount: {
    fontSize: 13,
    fontWeight: "900",
    color: G.textSecondary,
    textAlign: "right",
  },

  postCard: {
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
  postTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GInkSoft,
    lineHeight: 24,
  },
  postContent: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: GMuted,
  },
  postMetaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  postMetaText: {
    fontSize: 12,
    fontWeight: "700",
    color: GMutedLight,
  },

  boardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: G.buttonSecondary,
  },
  boardBadgeUrgent: {
    backgroundColor: G.errorSecondary,
  },
  boardBadgeNotice: {
    backgroundColor: G.buttonSecondary,
  },
  boardBadgeProgram: {
    backgroundColor: G.successSecondary,
  },
  boardBadgeGeneral: {
    backgroundColor: G.bgSecondary,
  },
  boardBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: G.textSecondary,
  },
  boardBadgeTextUrgent: {
    color: G.errorPrimary,
  },
  boardBadgeTextNotice: {
    color: G.textSecondary,
  },
  boardBadgeTextProgram: {
    color: G.successPrimary,
  },
  boardBadgeTextGeneral: {
    color: GMuted,
  },

  pinnedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FFF7E6",
  },
  pinnedBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#D97706",
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

  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(80, 49, 21, 0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  detailSheet: {
    width: "100%",
    maxWidth: 430,
    height: "90%",
    backgroundColor: G.bgSecondary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    overflow: "hidden",
  },
  detailHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: GMutedLight,
    alignSelf: "center",
    marginBottom: 10,
  },
  detailModalHeader: {
    height: 54,
    paddingHorizontal: 20,
    backgroundColor: G.bgSecondary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GInkSoft,
  },
  detailCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  detailCloseButtonText: {
    fontSize: 22,
    fontWeight: "900",
    color: GMuted,
    lineHeight: 24,
  },

  detailLoadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  detailHeroCard: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  detailBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: GInkSoft,
    lineHeight: 30,
  },

  recruitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FFF7E6",
  },
  recruitBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#D97706",
  },

  detailMetaGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  detailMetaItem: {
    flex: 1,
    backgroundColor: G.backgroundNeutral,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: GBorder,
  },
  detailMetaLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: GMutedLight,
    marginBottom: 5,
  },
  detailMetaValue: {
    fontSize: 12,
    fontWeight: "900",
    color: GInkSoft,
  },

  detailContentCard: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: GBorder,
  },
  detailContentTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: GInkSoft,
    marginBottom: 12,
  },
  detailContent: {
    fontSize: 15,
    lineHeight: 24,
    color: GMuted,
  },

  attachmentBox: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: G.backgroundNeutral,
    borderWidth: 1,
    borderColor: GBorder,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: GInkSoft,
    marginBottom: 8,
  },
  attachmentItem: {
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: GBorder,
  },
  attachmentText: {
    fontSize: 14,
    fontWeight: "800",
    color: G.textSecondary,
  },

  writeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(80, 49, 21, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  writeModal: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  writeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  writeInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GBorder,
    backgroundColor: G.bgSecondary,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "800",
    color: GInkSoft,
    marginBottom: 12,
  },
  writeTextArea: {
    minHeight: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GBorder,
    backgroundColor: G.bgSecondary,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: GInkSoft,
  },
  writeButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  writeCancelButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: G.buttonSecondary,
  },
  writeSubmitButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: G.buttonPrimary,
  },
  writeSubmitButtonDisabled: {
    backgroundColor: GBorder,
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
  detailInfoCard: {
    backgroundColor: G.backgroundNeutral,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GBorder,
    gap: 10,
  },
  detailInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  detailInfoLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: GMutedLight,
  },
  detailInfoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    color: GInkSoft,
  },
});