import { StyleSheet } from "react-native";

const BOX_SIZE = 240;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    camera: {
        flex: 1,
    },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    topBar: {
        position: "absolute",
        top: 45,
        left: 0,
        right: 0,
        height: 50,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 20,
        elevation: 20,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
    },

    backText: {
        color: "#fff",
        fontSize: 36,
        lineHeight: 38,
        fontWeight: "300",
    },

    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },

    rightBlank: {
        width: 42,
    },

    scanGuideContainer: {
        position: "absolute",
        top: "28%",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 10,
        elevation: 10,
    },

    scanBox: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        borderWidth: 2,
        borderColor: "rgba(255, 216, 77, 0.55)",
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.08)",
        position: "relative",
    },

    corner: {
        position: "absolute",
        width: 46,
        height: 46,
        borderColor: "#FFD84D",
        zIndex: 20,
        elevation: 20,
    },

    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 5,
        borderLeftWidth: 5,
        borderTopLeftRadius: 12,
    },

    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 5,
        borderRightWidth: 5,
        borderTopRightRadius: 12,
    },

    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 5,
        borderLeftWidth: 5,
        borderBottomLeftRadius: 12,
    },

    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 5,
        borderRightWidth: 5,
        borderBottomRightRadius: 12,
    },

    guideText: {
        marginTop: 22,
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        backgroundColor: "rgba(0,0,0,0.45)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },

    bottomBox: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 105,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 16,
        borderRadius: 16,
        zIndex: 20,
        elevation: 20,
    },

    resultTitle: {
        color: "white",
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 10,
    },

    resultText: {
        color: "white",
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 12,
    },

    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
        marginBottom: 12,
    },

    loadingText: {
        color: "white",
        fontSize: 13,
    },

    retryButton: {
        marginTop: 12,
        backgroundColor: "#FFD84D",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },

    retryText: {
        color: "#3A2A00",
        fontSize: 14,
        fontWeight: "800",
    },

    historyButton: {
        marginTop: 10,
        backgroundColor: "rgba(255,255,255,0.18)",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
    },

    historyText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },

    bottomTabWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        elevation: 30,
    },
        resultContainer: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },

    resultHeader: {
        height: 58,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },

    resultBackButton: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
    },

    resultBackText: {
        fontSize: 34,
        color: "#333333",
        lineHeight: 36,
    },

    resultHeaderTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#222222",
    },

    resultScroll: {
        flex: 1,
    },

    resultScrollContent: {
        padding: 18,
        paddingBottom: 36,
    },

    summaryCard: {
        backgroundColor: "#FFF4C7",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
    },

    summaryLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#7A5A00",
        marginBottom: 6,
    },

    summaryValue: {
        fontSize: 15,
        color: "#222222",
        lineHeight: 22,
    },

    resultDrugCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#EEEEEE",
    },

    resultDrugName: {
        fontSize: 16,
        fontWeight: "800",
        color: "#222222",
        marginBottom: 12,
        lineHeight: 23,
    },

    resultDrugText: {
        fontSize: 14,
        color: "#444444",
        lineHeight: 21,
        marginBottom: 3,
    },

    durBox: {
        marginTop: 12,
        backgroundColor: "#F6F6F6",
        borderRadius: 14,
        padding: 12,
    },

    durTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#222222",
        marginBottom: 8,
    },

    durWarningBox: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#FFE1E1",
    },

    durWarningCategory: {
        fontSize: 14,
        fontWeight: "800",
        color: "#D9534F",
        marginBottom: 4,
    },

    durWarningContent: {
        fontSize: 13,
        color: "#444444",
        lineHeight: 20,
        marginTop: 4,
    },

    durSafeText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2E8B57",
    },

    resultRetryButton: {
        marginTop: 8,
        backgroundColor: "#FFD84D",
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: "center",
    },

    resultRetryText: {
        color: "#3A2A00",
        fontSize: 15,
        fontWeight: "800",
    },

    resultHistoryButton: {
        marginTop: 10,
        backgroundColor: "#FFFFFF",
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDDDDD",
    },

    resultHistoryText: {
        color: "#333333",
        fontSize: 15,
        fontWeight: "800",
    },
});

export default styles;