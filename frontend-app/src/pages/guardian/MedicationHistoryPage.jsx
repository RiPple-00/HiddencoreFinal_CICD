import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../api";
import { resolveMedicationScanContext } from "../../utils/medicationScanContext";
import styles from "../../styles/medicationHistory";

export default function MedicationHistoryPage({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { patientId, guardianId } = await resolveMedicationScanContext();
            const params = { patientId };
            if (guardianId != null) {
                params.guardianId = guardianId;
            }

            const res = await api.get("/api/medications/history", { params });

            setRecords(res.data || []);
        } catch (error) {
            console.log("지난 처방기록 조회 실패:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>지난 처방기록을 불러오는 중...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.title}>지난 처방기록</Text>

                <View style={{ width: 32 }} />
            </View>

            <FlatList
                data={records}
                keyExtractor={(item) => String(item.medicationId)}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>저장된 처방기록이 없습니다.</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("MedicationHistoryDetail", {
                                medicationId: item.medicationId,
                            })
                        }
                    >
                        <Text style={styles.dateText}>
                            {item.prescriptionDate}
                        </Text>

                        <Text style={styles.summaryText} numberOfLines={2}>
                            {item.medicineSummary || "약 정보 없음"}
                        </Text>

                        <Text style={styles.moreText}>상세보기 ›</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

