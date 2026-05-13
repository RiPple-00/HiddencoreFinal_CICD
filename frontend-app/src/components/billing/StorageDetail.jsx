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
  View, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "../Text";
import storageApi from "../../api/storageApi";
import {
  normalizeInvoice, normalizePatient,
  formatWon, toNumber,
} from "../../utils/Storageformat";

const PATIENT_ID = 1; // TODO: 인증/세션에서

function FeeRow({ name, amount, isLast }) {
  return (
    <View className={`flex-row justify-between items-center py-2 ${!isLast ? "border-b border-guardian-bg-secondary" : ""}`}>
      <Text className="text-sm text-guardian-text-neutral flex-1 mr-2">{name}</Text>
      <Text className="text-sm font-bold text-guardian-text-primary">
        {typeof amount === "number" ? formatWon(amount) : amount}
      </Text>
    </View>
  );
}

function SectionHead({ label, gray = false }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      {/* 섹션 구분 도트: 급여=브랜드 노란, 비급여=흐린 중립 */}
      <View className={`w-2 h-2 rounded-full ${gray ? "bg-guardian-text-neutral opacity-40" : "bg-guardian-button-primary"}`} />
      <Text className={`text-sm font-bold ${gray ? "text-guardian-text-neutral" : "text-guardian-text-primary"}`}>
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
      const res = await storageApi.printReceipt({ patientId: PATIENT_ID, invoiceId, type: "receipt" });
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
    <SafeAreaView
      className="flex-1 bg-guardian-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-row items-center justify-between px-4 py-3 bg-background-neutral border-b border-guardian-button-secondary">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <Text className="text-3xl text-guardian-text-primary">‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-guardian-text-primary">영수증</Text>
        <TouchableOpacity
          onPress={handlePrint}
          disabled={printing || !invoiceId}
          className="w-10 items-end"
        >
          {printing ? (
            <ActivityIndicator size="small" color="#949BA0" />
          ) : (
            <Text className={`text-xl text-guardian-text-primary ${!invoiceId ? "opacity-30" : ""}`}>
              ⬇
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* 결제 항목 요약 */}
        {navPayment && (
          <View className="bg-background-neutral rounded-2xl p-4 mb-4 flex-row justify-between items-center border border-guardian-button-secondary">
            <View className="flex-1 mr-3">
              <Text className="text-xs text-guardian-text-neutral mb-1">선택한 결제 항목</Text>
              <Text className="text-base font-bold text-guardian-text-primary">{navPayment.title}</Text>
              <Text className="text-xs text-guardian-text-neutral mt-1">
                {navPayment.date} {navPayment.time}
              </Text>
            </View>
            <Text className="text-lg font-extrabold text-guardian-text-primary">
              {navPayment.amount}
            </Text>
          </View>
        )}

        {/* 에러 */}
        {error && (
          <View className="bg-error-secondary rounded-xl p-4 mb-4">
            <Text className="text-error-primary text-sm">{error}</Text>
          </View>
        )}

        {loading ? (
          <View className="bg-background-neutral rounded-2xl p-4 mb-4 py-10 items-center">
            <ActivityIndicator size="large" color="#FCC101" />
          </View>
        ) : (
          <View className="bg-background-neutral rounded-2xl p-4 mb-4">

            {/* 환자 정보 */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-full bg-guardian-button-primary justify-center items-center">
                <Text className="text-base font-bold text-guardian-text-primary">
                  {patient?.name?.[0] ?? "?"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-guardian-text-primary">
                  {patient?.name ?? "-"} 환자님
                </Text>
                <Text className="text-xs text-guardian-text-neutral mt-1">
                  {invoice?.period
                    ? `입원기간: ${invoice.period}`
                    : patient?.admissionDate
                    ? `입원일: ${patient.admissionDate}`
                    : ""}
                </Text>
                {invoice?.dept && (
                  <View className="bg-guardian-button-secondary rounded-full px-2 py-[3px] mt-1 self-start">
                    <Text className="text-xs font-bold text-guardian-text-primary">
                      {invoice.dept}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 급여 항목 */}
            {covered.length > 0 && (
              <View className="border-t border-guardian-bg-secondary pt-4">
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
              <View className="border-t border-guardian-bg-secondary pt-4 mt-4">
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
              <View className="flex-row justify-between items-center pt-4 border-t border-guardian-button-secondary mt-2">
                <Text className="text-base font-extrabold text-guardian-text-primary">합계</Text>
                <Text className="text-xl font-extrabold text-guardian-text-primary">{invoice.amount}</Text>
              </View>
            )}

            {/* 항목 없음 */}
            {covered.length === 0 && nonCovered.length === 0 && !error && (
              <View className="py-6 items-center">
                <Text className="text-sm text-guardian-text-neutral">
                  상세 항목이 제공되지 않았습니다.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 안내 문구 */}
        <View className="bg-guardian-bg-secondary rounded-xl p-4">
          {[
            "※ 위 금액은 심사 결과에 따라 최종 수납 금액과 차이가 있을 수 있습니다.",
            "※ 상세 항목에 대한 문의는 병원 원무과(02-123-4567)로 연락 바랍니다.",
            "※ 제증명 수수료는 별도로 부과될 수 있습니다.",
          ].map((text, i) => (
            <Text key={i} className="text-xs text-guardian-text-neutral leading-5 mb-1">
              {text}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}