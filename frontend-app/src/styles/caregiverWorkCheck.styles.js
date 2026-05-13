import { StyleSheet } from "react-native";
import { C } from "./caregiverTheme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bgPrimary,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: C.bgPrimary,
  },
  saveToolbar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.bgNeutral,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
  },
  saveToolbarText: {
    color: C.buttonPrimary,
    fontWeight: "800",
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800",
    color: C.textPrimary,
  },
  iconText: {
    fontSize: 20,
  },
  patientStrip: {
    marginTop: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.borderSoft,
    backgroundColor: C.bgSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  patientName: {
    fontSize: 28,
    fontWeight: "700",
    color: C.textPrimary,
  },
  patientMeta: {
    marginTop: 2,
    fontSize: 14,
    color: C.textSecondary,
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderSoft,
    backgroundColor: C.bgNeutral,
    overflow: "hidden",
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderRow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: C.textPrimary,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rowSubWarn: {
    marginTop: 3,
    fontSize: 11,
    color: C.errorPrimary,
    fontWeight: "700",
  },
  stateWrap: {
    flexDirection: "row",
    gap: 6,
  },
  stateBtn: {
    minWidth: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.borderSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: C.bgNeutral,
  },
  stateBtnActive: {
    backgroundColor: C.buttonPrimary,
    borderColor: C.buttonPrimary,
  },
  stateBtnDanger: {
    backgroundColor: C.errorSecondary,
    borderColor: C.errorPrimary,
  },
  stateText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
  },
  stateTextActive: {
    color: C.bgNeutral,
  },
  stateTextDanger: {
    color: C.errorPrimary,
  },
  memoInput: {
    margin: 10,
    borderWidth: 1,
    borderColor: C.borderSoft,
    borderRadius: 8,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: C.textPrimary,
    backgroundColor: C.bgPrimary,
  },
});
