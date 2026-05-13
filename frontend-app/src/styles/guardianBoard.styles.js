import { StyleSheet } from "react-native";

export const boardStyles = StyleSheet.create({
  boardTopArea: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#EEF2F7",
  },
  boardMenuButtonActive: {
    backgroundColor: "#0B4EA2",
  },
  boardMenuText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#64748B",
  },
  boardMenuTextActive: {
    color: "#FFFFFF",
  },

  boardSearchBox: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  boardSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  searchClearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  searchClearText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#64748B",
    lineHeight: 20,
  },

  writeButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: "#0B4EA2",
  },
  writeButtonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  boardSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  boardSectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  boardSectionCount: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0B4EA2",
  },

  postCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#111827",
    lineHeight: 24,
  },
  postContent: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
  postMetaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  postMetaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },

  boardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EAF3FF",
  },
  boardBadgeUrgent: {
    backgroundColor: "#FEF2F2",
  },
  boardBadgeNotice: {
    backgroundColor: "#EAF3FF",
  },
  boardBadgeProgram: {
    backgroundColor: "#EAFBF1",
  },
  boardBadgeGeneral: {
    backgroundColor: "#F1F5F9",
  },
  boardBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0B4EA2",
  },
  boardBadgeTextUrgent: {
    color: "#DC2626",
  },
  boardBadgeTextNotice: {
    color: "#0B4EA2",
  },
  boardBadgeTextProgram: {
    color: "#15803D",
  },
  boardBadgeTextGeneral: {
    color: "#64748B",
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
    color: "#64748B",
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#94A3B8",
  },

  detailModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(15, 23, 42, 0.55)",
  justifyContent: "flex-end",
  alignItems: "center",
},

detailSheet: {
  width: "100%",
  maxWidth: 430,
  height: "90%",
  backgroundColor: "#F4F6F8",
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  paddingTop: 10,
  overflow: "hidden",
},
  detailHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 10,
  },
  detailModalHeader: {
    height: 54,
    paddingHorizontal: 20,
    backgroundColor: "#F4F6F8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  detailCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  detailCloseButtonText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#64748B",
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
    backgroundColor: "#FFFFFF",
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
    color: "#111827",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailMetaLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94A3B8",
    marginBottom: 5,
  },
  detailMetaValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#334155",
  },

  detailContentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailContentTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  detailContent: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },

  attachmentBox: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  attachmentItem: {
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  attachmentText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0B4EA2",
  },

  writeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  writeModal: {
    backgroundColor: "#FFFFFF",
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
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  writeTextArea: {
    minHeight: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: "#111827",
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
    backgroundColor: "#EEF2F7",
  },
  writeSubmitButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: "#0B4EA2",
  },
  writeSubmitButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },

  modalCancelText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: "#64748B",
  },
  modalConfirmText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  detailInfoCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#E5E7EB",
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
  color: "#94A3B8",
},
detailInfoValue: {
  flex: 1,
  textAlign: "right",
  fontSize: 13,
  fontWeight: "800",
  color: "#334155",
},
});