import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0B4EA2",
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
  },
  tabButtonActive: {
    backgroundColor: "#0B4EA2",
  },
  tabText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
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
  programCard: {
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
    backgroundColor: "#EAF3FF",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0B4EA2",
  },
  programDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  programTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  programContent: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
  infoRow: {
    marginTop: 14,
    marginBottom: 14,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  applyButton: {
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: "#0B4EA2",
  },
  applyButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  applyButtonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  applyButtonTextDisabled: {
    color: "#94A3B8",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  historyInfo: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
  historyBottomRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0B4EA2",
  },
  historyDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 24,
},
confirmModal: {
  width: "100%",
  maxWidth: 340,
  backgroundColor: "#FFFFFF",
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
  backgroundColor: "#EAF3FF",
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
  color: "#0B4EA2",
  marginBottom: 10,
},
modalProgramTitle: {
  fontSize: 17,
  fontWeight: "900",
  color: "#111827",
  textAlign: "center",
  marginBottom: 8,
},
modalDescription: {
  fontSize: 15,
  lineHeight: 22,
  color: "#475569",
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
  backgroundColor: "#EEF2F7",
},
modalConfirmButton: {
  backgroundColor: "#0B4EA2",
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
statusBadgeActive: {
  backgroundColor: "#EAFBF1",
},
statusBadgeUpcoming: {
  backgroundColor: "#FFF7E6",
},
statusBadgeClosed: {
  backgroundColor: "#F1F5F9",
},
statusBadgeDefault: {
  backgroundColor: "#EAF3FF",
},
statusBadgeTextActive: {
  color: "#15803D",
},
statusBadgeTextUpcoming: {
  color: "#D97706",
},
statusBadgeTextClosed: {
  color: "#64748B",
},
statusBadgeTextDefault: {
  color: "#0B4EA2",
},
detailBox: {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  backgroundColor: "#F8FAFC",
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
  color: "#64748B",
},
detailValue: {
  flex: 1,
  textAlign: "right",
  fontSize: 13,
  fontWeight: "800",
  color: "#111827",
},
});