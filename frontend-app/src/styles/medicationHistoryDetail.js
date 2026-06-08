import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    loadingText: {
        marginTop: 10,
        color: "#555",
    },

    emptyText: {
        marginTop: 20,
        textAlign: "center",
        color: "#777",
        fontSize: 14,
    },

    header: {
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },

    backText: {
        fontSize: 34,
        color: "#333",
    },

    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#222",
    },

    content: {
        padding: 16,
        paddingBottom: 40,
    },

    summaryCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EAEAEA",
        marginBottom: 18,
    },

    dateText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#222",
        marginBottom: 8,
    },

    summaryText: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#222",
        marginBottom: 10,
    },

    drugCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#EAEAEA",
    },

    drugName: {
        fontSize: 16,
        fontWeight: "800",
        color: "#222",
        marginBottom: 10,
        lineHeight: 22,
    },

    drugText: {
        fontSize: 13,
        color: "#555",
        lineHeight: 19,
        marginBottom: 4,
    },

    infoBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#F8F9FA",
        borderRadius: 10,
    },

    infoTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#333",
        marginBottom: 8,
    },

    warningBox: {
        marginTop: 8,
        padding: 10,
        backgroundColor: "#FFF4F4",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FFD6D6",
    },

    warningCategory: {
        fontSize: 14,
        fontWeight: "800",
        color: "#D32F2F",
        marginBottom: 6,
    },

    warningContent: {
        fontSize: 13,
        color: "#444",
        lineHeight: 20,
        marginTop: 4,
    },

    safeText: {
        fontSize: 13,
        color: "#2E7D32",
        fontWeight: "700",
    },

    backButtonBox: {
        marginTop: 18,
        backgroundColor: "#FFD84D",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },

    backButtonText: {
        color: "#3A2A00",
        fontSize: 14,
        fontWeight: "800",
    },
});

export default styles;