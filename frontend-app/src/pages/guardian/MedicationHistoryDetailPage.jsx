import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../api";
import styles from "../../styles/medicationHistoryDetail";

function uniqueDurWarnings(warnings) {
    if (!Array.isArray(warnings)) return [];

    const seen = new Set();

    return warnings.filter((warning) => {
        const key = [
            warning.durCategory,
            warning.durIngredientName,
            warning.durContent,
            warning.durNotificationDate,
        ].join("|");

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function parseJsonMaybe(value) {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function MedicationHistoryDetailPage({ route, navigation }) {
    const medicationId = route?.params?.medicationId;

    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(null);

    useEffect(() => {
        fetchDetail();
    }, [medicationId]);

    const fetchDetail = async () => {
        if (!medicationId) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/api/medications/${medicationId}`);

            console.log("요청 medicationId:", medicationId);
            console.log("처방 상세 조회 성공:", res.data);
            console.log("details:", res.data?.details);
            console.log("details length:", res.data?.details?.length);

            setRecord(res.data);
            console.log("처방 상세 조회 성공:", res.data);
            setRecord(res.data);
        } catch (error) {
            console.log("처방 상세 조회 실패:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>처방 상세 정보를 불러오는 중...</Text>
            </View>
        );
    }

    if (!record) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>처방 상세 정보를 찾을 수 없습니다.</Text>

                <TouchableOpacity
                    style={styles.backButtonBox}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>돌아가기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const details = record.details || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.title}>처방 상세</Text>

                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.dateText}>
                        처방일자: {record.prescriptionDate || "-"}
                    </Text>

                    <Text style={styles.summaryText}>
                        {record.medicineSummary || "약 정보 없음"}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>약 상세 정보</Text>

                {details.length === 0 ? (
                    <Text style={styles.emptyText}>저장된 약 상세 정보가 없습니다.</Text>
                ) : (
                    details.map((drug, index) => {
                        const durWarnings = uniqueDurWarnings(parseJsonMaybe(drug.durWarnings));

                        return (
                            <View
                                key={drug.medicationDetailId || `${drug.itemSeq}-${index}`}
                                style={styles.drugCard}
                            >
                                <Text style={styles.drugName}>
                                    {index + 1}. {drug.medicineName || drug.itemName || "약 이름 없음"}
                                </Text>

                                <Text style={styles.drugText}>
                                    제조사: {drug.manufacturerName || drug.permitEntpName || "-"}
                                </Text>

                                <Text style={styles.drugText}>
                                    구분: {drug.specialGeneralType || "-"} / {drug.payType || "-"}
                                </Text>

                                <Text style={styles.drugText}>
                                    투여경로: {drug.route || "-"}
                                </Text>

                                <Text style={styles.drugText}>
                                    약품코드: {drug.itemSeq || "-"}
                                </Text>

                                <View style={styles.infoBox}>
                                    <Text style={styles.infoTitle}>허가 정보</Text>

                                    <Text style={styles.drugText}>
                                        제품명: {drug.permitItemName || "-"}
                                    </Text>

                                    <Text style={styles.drugText}>
                                        품목기준코드: {drug.permitItemSeq || "-"}
                                    </Text>
                                </View>

                                <View style={styles.infoBox}>
                                    <Text style={styles.infoTitle}>DUR 주의사항</Text>

                                    {drug.durInfoFound && durWarnings.length > 0 ? (
                                        durWarnings.map((warning, warningIndex) => (
                                            <View key={warningIndex} style={styles.warningBox}>
                                                <Text style={styles.warningCategory}>
                                                    {warning.durCategory || "주의사항"}
                                                </Text>

                                                <Text style={styles.drugText}>
                                                    성분: {warning.durIngredientName || "-"}
                                                </Text>

                                                {warning.durContent ? (
                                                    <Text style={styles.warningContent}>
                                                        {warning.durContent}
                                                    </Text>
                                                ) : (
                                                    <Text style={styles.drugText}>
                                                        상세 주의 내용 없음
                                                    </Text>
                                                )}

                                                <Text style={styles.drugText}>
                                                    고시일자: {warning.durNotificationDate || "-"}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.safeText}>DUR 주의사항 없음</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}