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
    },

    loadingText: {
        marginTop: 10,
        color: "#555",
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

    listContent: {
        padding: 16,
    },

    emptyText: {
        marginTop: 30,
        textAlign: "center",
        color: "#777",
    },

    card: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#EAEAEA",
    },

    dateText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#222",
        marginBottom: 8,
    },

    summaryText: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },

    moreText: {
        marginTop: 10,
        fontSize: 13,
        color: "#777",
        fontWeight: "700",
        textAlign: "right",
    },
});

export default styles;