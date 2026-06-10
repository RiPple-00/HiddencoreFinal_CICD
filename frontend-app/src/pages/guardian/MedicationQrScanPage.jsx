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

const SCAN_API_TIMEOUT_MS = 65000;

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

function resolveScanErrorMessage(error) {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error?.code === "ECONNABORTED") {
        return "서버 응답 시간이 초과되었습니다. Wi-Fi와 백엔드 실행 상태를 확인해 주세요.";
    }
    if (error?.message?.includes("Network Error")) {
        return "서버에 연결할 수 없습니다. PC와 폰이 같은 Wi-Fi인지 확인해 주세요.";
    }
    return "처방전 저장에 실패했습니다.";
}

export default function MedicationQrScanPage({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [saving, setSaving] = useState(false);
    const [qrText, setQrText] = useState("");
    const [savedMedication, setSavedMedication] = useState(null);
    const scanLockRef = useRef(false);
    const lastScanRef = useRef({ data: "", at: 0 });

    const resetScanState = () => {
        scanLockRef.current = false;
        setScanned(false);
        setSaving(false);
        setQrText("");
        setSavedMedication(null);
    };

    const handleQrScanned = async ({ data }) => {
        if (scanLockRef.current) return;

        const now = Date.now();
        if (
            lastScanRef.current.data === data &&
            now - lastScanRef.current.at < 3000
        ) {
            return;
        }
        lastScanRef.current = { data, at: now };

        scanLockRef.current = true;
        setScanned(true);
        setSaving(true);
        setQrText(data);
        setSavedMedication(null);

        console.log("QR 원문:", data);

        try {
            const { patientId, guardianId } = await resolveMedicationScanContext();

            const res = await api.post(
                "/api/medications/scan",
                {
                    patientId,
                    guardianId,
                    qrRawData: data,
                },
                { timeout: SCAN_API_TIMEOUT_MS }
            );

            console.log("복약 저장 성공:", res.data);

            setSavedMedication(res.data);

            Alert.alert(
                "저장 완료",
                `${res.data.prescriptionDate} 처방전이 저장되었습니다.`
            );
        } catch (e) {
            console.log("복약 저장 실패:", e?.response?.data || e.message);

            Alert.alert("저장 실패", resolveScanErrorMessage(e));

            scanLockRef.current = false;
            setScanned(false);
            setQrText("");
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
                        onPress={resetScanState}
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
                        onPress={resetScanState}
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
        <View style={styles.page}>
            <View style={styles.cameraArea}>
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
            </View>

            <View style={styles.bottomPanel}>
                <Text style={styles.resultTitle}>
                    {qrText ? "처방전 저장 중" : "QR을 스캔해주세요"}
                </Text>

                {saving ? (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator color="#FFD84D" />
                        <Text style={styles.loadingText}>
                            QR 인식 완료 · 약 정보를 조회·저장하는 중 (보통 30초 이내)...
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.resultText} numberOfLines={4}>
                        {qrText || "카메라를 처방전 QR 코드에 가까이 가져가세요."}
                    </Text>
                )}

                {scanned && !saving && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={resetScanState}
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
