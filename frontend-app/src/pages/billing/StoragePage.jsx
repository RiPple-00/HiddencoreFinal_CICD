/**
 * 수납 메인 화면
 * 진입: 다른 팀원 홈 화면 하단 탭바 "수납" 클릭
 *
 * 호출 API:
 *   - storageApi.getPatients({ id })
 *   - storageApi.getOverdueHistories({ patientId, limit })
 *
 * 화면 이동 (navigation prop 통해):
 *   - PaymentHistory      : 최근 결제 내역
 *   - StorageList         : 청구서 목록
 *   - InvoicePaymentList  : 미납·부분납 항목 클릭 시
 */

import { useEffect, useState } from "react";
import {
  View, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import storageApi from "../../api/storageApi";
import { normalizePatient, normalizePayment } from "../../utils/Storageformat";
import { TAG_COLORS, STATUS_COLORS } from "../../styles/colors";
import Text from "@/components/Text";

// TODO: 인증/세션에서 환자 ID 가져오도록 변경 필요
const PATIENT_ID = 1;

export default function StoragePage({ navigation }) {
  const [patient,     setPatient]     = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [patientsRes, overdueRes] = await Promise.all([
          storageApi.getPatients({ id: PATIENT_ID }),
          storageApi.getOverdueHistories({ patientId: PATIENT_ID, limit: 5 }),
        ]);
        if (cancelled) return;

        const patientsData = patientsRes.data?.data ?? patientsRes.data ?? [];
        const overdueData  = overdueRes.data?.data  ?? overdueRes.data  ?? [];

        const normalizedPatient = Array.isArray(patientsData)
          ? normalizePatient(patientsData[0] ?? {})
          : normalizePatient(patientsData);

        const normalizedOverdue = (Array.isArray(overdueData) ? overdueData : [])
          .map(normalizePayment)
          .slice(0, 5);

        setPatient(normalizedPatient);
        setPendingList(normalizedOverdue);
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-primary">

      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background-neutral border-b border-guardian-button-secondary">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 justify-center"
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <Text className="text-3xl text-guardian-text-primary">‹</Text>
        </TouchableOpacity>

        <Text className="text-lg font-bold text-guardian-text-primary">청구 내역</Text>

        {/* 가운데 정렬용 스페이서 */}
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* 환자 정보 + 예상 수납 카드 */}
        <View className="mx-4 mt-4 bg-background-neutral rounded-2xl p-4 mb-4">

          {/* 환자 행 */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-12 h-12 rounded-full bg-guardian-button-primary justify-center items-center">
              <Text className="text-lg font-bold text-guardian-text-primary">
                {patient?.name?.[0] ?? "?"}
              </Text>
            </View>
            <View className="flex-1">
              {loading ? (
                <ActivityIndicator size="small" color="#FCC101" />
              ) : (
                <>
                  <Text className="text-base font-bold text-guardian-text-primary">
                    {patient?.name ?? "-"} 님
                  </Text>
                  <Text className="text-xs text-guardian-text-neutral mt-[2px]">
                    {patient?.room ? `${patient.room}호 ` : ""}{patient?.status ?? ""}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* 예상 수납 헤더 */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-bold text-guardian-text-primary">예상 수납 금액</Text>
            <Text className="text-xs text-guardian-text-neutral">
              {patient?.expectedTotalAsOf ? `${patient.expectedTotalAsOf} 기준` : ""}
            </Text>
          </View>

          {/* 금액 카드 */}
          <View className="bg-guardian-bg-secondary rounded-2xl p-4">
            <Text className="text-xs text-guardian-text-neutral mb-1">현재까지 정산된 금액</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#FCC101" style={{ marginVertical: 8 }} />
            ) : (
              <Text className="text-2xl font-extrabold text-guardian-text-primary mb-4">
                {(patient?.expectedTotal ?? 0).toLocaleString("ko-KR")}
                <Text className="text-base font-normal text-guardian-text-neutral"> KRW</Text>
              </Text>
            )}

            <TouchableOpacity
              className="bg-guardian-button-primary rounded-full py-3 items-center mb-2"
              onPress={() => navigation.navigate("PaymentHistory")}
            >
              <Text className="font-bold text-guardian-text-primary">최근 결제 내역 보기 →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-guardian-button-secondary border border-guardian-button-primary rounded-full py-3 items-center"
              onPress={() => navigation.navigate("StorageList")}
            >
              <Text className="font-bold text-guardian-text-primary">청구서 내역 보기 →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 에러 */}
        {error && (
          <View className="mx-4 bg-error-secondary rounded-xl p-4 mb-4">
            <Text className="text-error-primary text-sm">{error}</Text>
          </View>
        )}

        {/* 미납·부분납 */}
        {!loading && pendingList.length > 0 && (
          <View className="mx-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-bold text-guardian-text-primary">미납·부분납 항목</Text>
              <TouchableOpacity onPress={() => navigation.navigate("InvoicePaymentList")}>
                <Text className="text-sm font-bold text-guardian-text-secondary">전체보기 →</Text>
              </TouchableOpacity>
            </View>

            {pendingList.map((pay) => {
              const tagColor    = TAG_COLORS[pay.tag]    ?? { bg: "#FEF7E5", text: "#503115" };
              const statusColor = STATUS_COLORS[pay.status] ?? STATUS_COLORS.미납;
              return (
                <TouchableOpacity
                  key={pay.id}
                  className="bg-background-neutral rounded-2xl p-4 mb-3 border border-guardian-button-secondary flex-row justify-between items-center"
                  onPress={() => navigation.navigate("InvoicePaymentList", { payment: pay })}
                >
                  <View className="flex-1 mr-3">
                    <View className="flex-row gap-2 mb-2">
                      <View style={{ backgroundColor: statusColor.bg }} className="px-2 py-[3px] rounded-full">
                        <Text style={{ color: statusColor.text }} className="text-[11px] font-bold">
                          {pay.status}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: tagColor.bg }} className="px-2 py-[3px] rounded-full">
                        <Text style={{ color: tagColor.text }} className="text-[11px] font-bold">
                          {pay.tag}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm font-bold text-guardian-text-primary mb-1" numberOfLines={1}>
                      {pay.title}
                    </Text>
                    <Text className="text-xs text-guardian-text-neutral">
                      {pay.date} {pay.time}
                    </Text>
                  </View>
                  <Text style={{ color: statusColor.amount }} className="font-bold text-base">
                    {pay.amount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 로딩 */}
        {loading && (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#FCC101" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}