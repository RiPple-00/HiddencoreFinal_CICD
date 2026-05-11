import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F4F6F8",
    },
    container: {
        flex: 1,
        width: "100%",
        maxWidth: 430,
        alignSelf: "center",
        backgroundColor: "#F4F6F8",
    },
    scrollContent: {
        paddingBottom: 120,
    },

    header: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    logoIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    logoText: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0B4EA2",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerIcon: {
        fontSize: 22,
        marginLeft: 12,
    },

    section: {
        paddingHorizontal: 20,
        marginTop: 22,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0B4EA2",
        marginBottom: 14,
    },
    sectionTitleNoMargin: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0B4EA2",
    },

    galleryCard: {
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
    },
    galleryImage: {
        height: 200,
    },
    galleryBadge: {
        position: "absolute",
        right: 14,
        bottom: 14,
        backgroundColor: "rgba(0,0,0,0.35)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
    },
    galleryBadgeText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },

    quickMenuWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
        paddingHorizontal: 16,
        marginTop: 16,
    },

    quickCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#C7D7ED",
        borderRadius: 24,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },

    quickIcon: {
        fontSize: 24,
        marginBottom: 8,
    },

    quickText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#1F2937",
        textAlign: "center",
        lineHeight: 20,
    },

    mealCard: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#C7D7ED",
        borderRadius: 28,
        padding: 18,
    },
    mealHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    mealTabs: {
        flexDirection: "row",
        backgroundColor: "#ECECEC",
        borderRadius: 24,
        padding: 4,
    },
    mealTab: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 18,
    },
    mealTabActive: {
        backgroundColor: "#FFFFFF",
    },
    mealTabText: {
        color: "#6B7280",
        fontWeight: "600",
    },
    mealTabTextActive: {
        color: "#0B4EA2",
        fontWeight: "800",
    },
    mealContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    mealImage: {
        width: 110,
        height: 110,
        borderRadius: 22,
        marginRight: 14,
    },
    mealTextWrap: {
        flex: 1,
    },
    mealMainText: {
        fontSize: 19,
        fontWeight: "800",
        color: "#0B4EA2",
        marginBottom: 8,
    },
    mealSubText: {
        fontSize: 16,
        color: "#374151",
        lineHeight: 23,
    },
    doneBadge: {
        alignSelf: "flex-start",
        marginTop: 12,
        backgroundColor: "#DCEBFF",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    doneBadgeText: {
        color: "#0B4EA2",
        fontWeight: "700",
        fontSize: 14,
    },

    noticeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    noticeMore: {
        color: "#0B4EA2",
        fontSize: 16,
        fontWeight: "700",
    },
    noticeCard: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#C7D7ED",
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 20,
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    noticeTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0B4EA2",
        marginBottom: 6,
    },
    noticeDate: {
        color: "#6B8FC3",
        fontSize: 15,
    },
    noticeArrow: {
        fontSize: 28,
        color: "#B8C2D1",
    },

    bottomNav: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 84,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#D8E1EE",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: 8,
    },
    bottomItem: {
        alignItems: "center",
    },
    bottomIcon: {
        fontSize: 21,
        marginBottom: 4,
    },
    bottomLabel: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "600",
    },
    bottomLabelActive: {
        color: "#0B4EA2",
        fontWeight: "800",
    },

    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    drawer: {
        position: "absolute",
        right: 0,
        top: 0,
        width: 250,
        height: "100%",
        backgroundColor: "#fff",
        padding: 20,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    drawerItem: {
        paddingVertical: 15,
    },
    heroCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        elevation: 3,
    },
    heroImage: {
        width: '100%',
        height: 160,
    },
    heroBody: {
        padding: 16,
        gap: 8,
    },
    heroTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    heroBadge: {
        fontSize: 12,
        color: '#2563eb',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        overflow: 'hidden',
    },
    heroTime: {
        fontSize: 14,
        color: '#2563eb',
    },
    heroDesc: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
    },
    noticeInner: {
        paddingHorizontal: 16,
        marginTop: 22,
    },
});