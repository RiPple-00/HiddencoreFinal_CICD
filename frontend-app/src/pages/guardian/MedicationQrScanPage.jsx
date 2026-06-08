import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import api from "../../api";
import { resolveMedicationScanContext } from "../../utils/medicationScanContext";
import styles from "../../styles/medicationQrScan";

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

function parseMedicineData(medicineData) {
    if (!medicineData) return [];

    if (Array.isArray(medicineData)) {
        return medicineData;
    }

    try {
        const parsed = JSON.parse(medicineData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log("medicineData 파싱 실패:", error);
        return [];
    }
}

export default function MedicationQrScanPage({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [saving, setSaving] = useState(false);
    const [qrText, setQrText] = useState("");
    const [savedMedication, setSavedMedication] = useState(null);
    const scanLockRef = useRef(false);

    const handleQrScanned = async ({ data }) => {
        if (scanLockRef.current) return;

        scanLockRef.current = true;
        setScanned(true);
        setSaving(true);
        setQrText(data);
        setSavedMedication(null);

        console.log("QR 원문:", data);

        try {
            const { patientId, guardianId } = await resolveMedicationScanContext();

            const res = await api.post("/api/medications/scan", {
                patientId,
                guardianId,
                qrRawData: data,
            });

            console.log("복약 저장 성공:", res.data);

            setSavedMedication(res.data);

            Alert.alert(
                "저장 완료",
                `${res.data.prescriptionDate} 처방전이 저장되었습니다.`
            );
        } catch (e) {
            console.log("복약 저장 실패:", e?.response?.data || e.message);

            const message =
                e?.response?.data?.message ||
                e?.response?.data?.detail ||
                "처방전 저장에 실패했습니다.";

            Alert.alert("저장 실패", message);

            scanLockRef.current = false;
            setScanned(false);
        } finally {
            setSaving(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.center}>
                <Text>카메라 권한 확인 중...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text>처방전 QR 스캔을 위해 카메라 권한이 필요합니다.</Text>
                <Button
                    title="카메라 권한 허용"
                    onPress={requestPermission}
                />
            </View>
        );
    }
    if (savedMedication) {
        const medicineList = parseMedicineData(savedMedication.medicineData);

        return (
            <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                    <TouchableOpacity
                        style={styles.resultBackButton}
                        onPress={() => {
                            scanLockRef.current = false;
                            setScanned(false);
                            setSaving(false);
                            setQrText("");
                            setSavedMedication(null);
                        }}
                    >
                        <Text style={styles.resultBackText}>‹</Text>
                    </TouchableOpacity>

                    <Text style={styles.resultHeaderTitle}>처방전 저장 완료</Text>

                    <View style={styles.rightBlank} />
                </View>

                <ScrollView
                    style={styles.resultScroll}
                    contentContainerStyle={styles.resultScrollContent}
                >
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>처방일자</Text>
                        <Text style={styles.summaryValue}>
                            {savedMedication.prescriptionDate}
                        </Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>처방 요약</Text>
                        <Text style={styles.summaryValue}>
                            {savedMedication.medicineSummary}
                        </Text>
                    </View>

                    {medicineList.map((drug, index) => {
                        const durWarnings = uniqueDurWarnings(drug.durWarnings);

                        return (
                            <View
                                key={`${drug.itemSeq}-${index}`}
                                style={styles.resultDrugCard}
                            >
                                <Text style={styles.resultDrugName}>
                                    {index + 1}. {drug.medicineName || drug.itemName || "약 이름 없음"}
                                </Text>

                                <Text style={styles.resultDrugText}>
                                    제조사: {drug.manufacturerName || drug.permitEntpName || "-"}
                                </Text>

                                <Text style={styles.resultDrugText}>
                                    구분: {drug.specialGeneralType || "-"} / {drug.payType || "-"}
                                </Text>

                                <Text style={styles.resultDrugText}>
                                    투여경로: {drug.route || "-"}
                                </Text>

                                <Text style={styles.resultDrugText}>
                                    약품코드: {drug.itemSeq || "-"}
                                </Text>

                                <View style={styles.durBox}>
                                    <Text style={styles.durTitle}>DUR 주의사항</Text>

                                    {drug.durInfoFound && durWarnings.length > 0 ? (
                                        durWarnings.map((warning, warningIndex) => (
                                            <View
                                                key={warningIndex}
                                                style={styles.durWarningBox}
                                            >
                                                <Text style={styles.durWarningCategory}>
                                                    {warning.durCategory || "주의사항"}
                                                </Text>

                                                <Text style={styles.resultDrugText}>
                                                    성분: {warning.durIngredientName || "-"}
                                                </Text>

                                                <Text style={styles.durWarningContent}>
                                                    {warning.durContent || "상세 주의 내용 없음"}
                                                </Text>

                                                <Text style={styles.resultDrugText}>
                                                    고시일자: {warning.durNotificationDate || "-"}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.durSafeText}>
                                            DUR 주의사항 없음
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.resultRetryButton}
                        onPress={() => {
                            scanLockRef.current = false;
                            setScanned(false);
                            setSaving(false);
                            setQrText("");
                            setSavedMedication(null);
                        }}
                    >
                        <Text style={styles.resultRetryText}>다시 스캔</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resultHistoryButton}
                        onPress={() => navigation.navigate("MedicationHistory")}
                    >
                        <Text style={styles.resultHistoryText}>지난 처방기록 보기</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned || saving ? undefined : handleQrScanned}
            />

            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>처방전 QR 스캔</Text>

                <View style={styles.rightBlank} />
            </View>

            <View style={styles.scanGuideContainer}>
                <View style={styles.scanBox}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>


            </View>

            <View style={styles.bottomBox}>
                <Text style={styles.resultTitle}>
                    {savedMedication
                        ? "처방전 저장 완료"
                        : qrText
                            ? "처방전 저장 중"
                            : "QR을 스캔해주세요"}
                </Text>

                {saving ? (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator />
                        <Text style={styles.loadingText}>처방전 정보를 저장하는 중...</Text>
                    </View>
                ) : savedMedication ? (
                    <ScrollView style={styles.medicineScroll}>
                        <Text style={styles.resultText}>
                            처방일자: {savedMedication.prescriptionDate}
                        </Text>

                        <Text style={styles.resultText}>
                            {savedMedication.medicineSummary}
                        </Text>

                        {parseMedicineData(savedMedication.medicineData).map((drug, index) => (
                            <View key={`${drug.itemSeq}-${index}`} style={styles.drugCard}>
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
                                    <Text style={styles.infoTitle}>DUR 주의사항</Text>

                                    {drug.durInfoFound && uniqueDurWarnings(drug.durWarnings).length > 0 ? (
                                        uniqueDurWarnings(drug.durWarnings).map((warning, warningIndex) => (
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
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={styles.resultText} numberOfLines={4}>
                        {qrText || "카메라를 처방전 QR 코드에 가까이 가져가세요."}
                    </Text>
                )}

                {scanned && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            scanLockRef.current = false;
                            setScanned(false);
                            setSaving(false);
                            setQrText("");
                            setSavedMedication(null);
                        }}
                    >
                        <Text style={styles.retryText}>다시 스캔</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate("MedicationHistory")}
                >
                    <Text style={styles.historyText}>지난 처방기록 보기</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}
