/**
 * 영수증 상세 화면
 * ─────────────────────────────────────────────
 * 진입 (두 가지):
 *   1) 결제 내역 카드 → route.params.payment (+ invoiceId)
 *   2) 청구서 카드     → route.params.invoice
 *
 * 호출 API:
 *   - storageApi.getPatients({ id })
 *   - storageApi.getInvoices({ id, patientId })  : invoiceId 있을 때
 *   - storageApi.printReceipt({ ... })           : 영수증 다운로드
 */

import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Linking, Alert,
} from "react-native";
import storageApi from "../../api/storageApi";
import {
  normalizeInvoice, normalizePatient,
  formatWon, toNumber,
} from "../../utils/Storageformat";
import { styles } from "../../styles/storageDetail.styles";
import { COLORS } from "../../styles/colors";

const PATIENT_ID = 1; // TODO: 인증/세션에서

function FeeRow({ name, amount, isLast }) {
  return (
    <View style={[styles.feeRow, isLast && styles.feeRowLast]}>
      <Text style={styles.feeName}>{name}</Text>
      <Text style={styles.feeAmount}>
        {typeof amount === "number" ? formatWon(amount) : amount}
      </Text>
    </View>
  );
}

function SectionHead({ label, gray = false }) {
  return (
    <View style={styles.sectionHead}>
      <View style={[styles.sectionDot, gray ? styles.sectionDotGray : styles.sectionDotBlue]} />
      <Text style={[styles.sectionLabel, gray ? styles.sectionLabelGray : styles.sectionLabelBlue]}>
        {label}
      </Text>
    </View>
  );
}

export default function StorageDetail({ route, navigation }) {
  const navPayment = route.params?.payment;
  const navInvoice = route.params?.invoice;
  const invoiceId  = route.params?.invoiceId ?? navInvoice?.id ?? navPayment?.invoiceId;

  const [patient,  setPatient]  = useState(null);
  const [invoice,  setInvoice]  = useState(navInvoice ?? null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const calls = [storageApi.getPatients({ id: PATIENT_ID })];
        if (invoiceId) calls.push(storageApi.getInvoices({ id: invoiceId, patientId: PATIENT_ID }));
        const responses = await Promise.all(calls);
        if (cancelled) return;

        const patientsRaw = responses[0].data?.data ?? responses[0].data ?? [];
        setPatient(
          Array.isArray(patientsRaw)
            ? normalizePatient(patientsRaw[0] ?? {})
            : normalizePatient(patientsRaw)
        );

        if (responses[1]) {
          const invoiceRaw = responses[1].data?.data ?? responses[1].data ?? [];
          const invObj = Array.isArray(invoiceRaw) ? invoiceRaw[0] : invoiceRaw;
          if (invObj) {
            setInvoice({
              ...normalizeInvoice(invObj),
              covered:    invObj.covered    ?? invObj.coveredItems    ?? [],
              nonCovered: invObj.nonCovered ?? invObj.nonCoveredItems ?? [],
              period:     invObj.period     ?? "",
              dept:       invObj.dept       ?? invObj.department ?? "",
            });
          }
        }
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "상세 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceId]);

  const handlePrint = async () => {
    if (!invoiceId) return;
    try {
      setPrinting(true);
      const res = await storageApi.printReceipt({
        patientId: PATIENT_ID,
        invoiceId,
        type: "receipt",
      });
      const url = res.data?.url ?? res.data?.data?.url;
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert("발급 완료", "영수증이 발급되었습니다.");
      }
    } catch (e) {
      Alert.alert("오류", e?.message ?? "영수증 발급에 실패했습니다.");
    } finally {
      setPrinting(false);
    }
  };

  const covered    = invoice?.covered    ?? [];
  const nonCovered = invoice?.nonCovered ?? [];

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>영수증</Text>
        <TouchableOpacity
          onPress={handlePrint}
          disabled={printing || !invoiceId}
          style={styles.printButton}
        >
          {printing ? (
            <ActivityIndicator size="small" color={COLORS.textMuted} />
          ) : (
            <Text style={[styles.printIcon, (!invoiceId) && styles.printIconDisabled]}>⬇</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 결제 항목 요약 */}
        {navPayment && (
          <View style={styles.paymentSummary}>
            <View>
              <Text style={styles.paymentSummaryLabel}>선택한 결제 항목</Text>
              <Text style={styles.paymentSummaryTitle}>{navPayment.title}</Text>
              <Text style={styles.paymentSummaryDate}>{navPayment.date} {navPayment.time}</Text>
            </View>
            <Text style={styles.paymentSummaryAmount}>{navPayment.amount}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={[styles.detailCard, styles.loadingBox]}>
            <ActivityIndicator size="large" color={COLORS.blue400} />
          </View>
        ) : (
          <View style={styles.detailCard}>
            {/* 환자 정보 */}
            <View style={styles.patientRow}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>{patient?.name?.[0] ?? "?"}</Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient?.name ?? "-"} 환자님</Text>
                <Text style={styles.patientPeriod}>
                  {invoice?.period
                    ? `입원기간: ${invoice.period}`
                    : patient?.admissionDate
                    ? `입원일: ${patient.admissionDate}`
                    : ""}
                </Text>
                {invoice?.dept && (
                  <View style={styles.deptBadge}>
                    <Text style={styles.deptBadgeText}>{invoice.dept}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 급여 항목 */}
            {covered.length > 0 && (
              <View style={styles.section}>
                <SectionHead label="급여 항목" />
                {covered.map((item, idx) => (
                  <FeeRow
                    key={item.name ?? idx}
                    name={item.name}
                    amount={typeof item.amount === "number" ? item.amount : toNumber(item.amount)}
                    isLast={idx === covered.length - 1}
                  />
                ))}
              </View>
            )}

            {/* 비급여 항목 */}
            {nonCovered.length > 0 && (
              <View style={[styles.section, styles.sectionTopMargin]}>
                <SectionHead label="비급여 항목" gray />
                {nonCovered.map((item, idx) => (
                  <FeeRow
                    key={item.name ?? idx}
                    name={item.name}
                    amount={typeof item.amount === "number" ? item.amount : toNumber(item.amount)}
                    isLast={idx === nonCovered.length - 1}
                  />
                ))}
              </View>
            )}

            {/* 합계 */}
            {invoice?.amount && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>합계</Text>
                <Text style={styles.totalAmount}>{invoice.amount}</Text>
              </View>
            )}

            {covered.length === 0 && nonCovered.length === 0 && !error && (
              <View style={styles.noItemsBox}>
                <Text style={styles.noItemsText}>상세 항목이 제공되지 않았습니다.</Text>
              </View>
            )}
          </View>
        )}

        {/* 안내 문구 */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>※ 위 금액은 심사 결과에 따라 최종 수납 금액과 차이가 있을 수 있습니다.</Text>
          <Text style={styles.noticeText}>※ 상세 항목에 대한 문의는 병원 원무과(02-123-4567)로 연락 바랍니다.</Text>
          <Text style={styles.noticeText}>※ 제증명 수수료는 별도로 부과될 수 있습니다.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


