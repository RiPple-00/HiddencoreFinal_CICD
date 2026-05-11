import React from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Text from "../../../components/Text";

export default function VisitReservationCompletePage({ data, onHome }) {
  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-guardian-bg-secondary">
        <TouchableOpacity
          className="bg-guardian-button-primary py-4 rounded-xl items-center mx-5 mt-5"
          onPress={onHome}
        >
          <Text className="text-guardian-text-primary text-base font-extrabold">
            홈으로 이동
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-secondary">

      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-[14px] bg-background-neutral border-b border-guardian-button-secondary">
        <TouchableOpacity onPress={onHome} hitSlop={12}>
          <Text className="text-[22px] text-guardian-text-primary w-10">←</Text>
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-guardian-text-primary">
          방문 예약 신청
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 성공 아이콘 */}
        <View className="self-center w-[72px] h-[72px] rounded-2xl bg-guardian-button-secondary items-center justify-center mb-4">
          <Text className="w-11 h-11 rounded-full bg-guardian-button-primary text-guardian-text-primary text-center text-2xl font-extrabold leading-[44px] overflow-hidden">
            ✓
          </Text>
        </View>

        {/* 완료 제목 */}
        <Text className="text-[21px] font-extrabold text-guardian-text-primary text-center mb-3">
          면회 신청이 완료되었습니다
        </Text>

        {/* 승인 대기 뱃지 */}
        <View className="self-center flex-row items-center bg-guardian-button-secondary px-3 py-[6px] rounded-[20px] mb-6 gap-[6px]">
          <Text className="text-[8px] text-guardian-text-primary">●</Text>
          <Text className="text-[13px] font-bold text-guardian-text-primary">승인 대기</Text>
        </View>

        {/* 예약 상세 카드 */}
        <View className="bg-background-neutral rounded-2xl p-[18px] mb-4">
          <Text className="text-base font-extrabold text-guardian-text-primary mb-[14px]">
            예약 상세 내역
          </Text>

          <View className="mb-1">
            <Text className="text-[11px] font-bold text-guardian-text-neutral opacity-50 mb-[6px] tracking-wide">
              VISIT DATE
            </Text>
            <Text className="text-[15px] font-bold text-guardian-text-primary">
              {data.visitDateDetail}
            </Text>
          </View>

          <View className="h-[0.5px] bg-guardian-bg-secondary my-3" />

          <View className="mb-1">
            <Text className="text-[11px] font-bold text-guardian-text-neutral opacity-50 mb-[6px] tracking-wide">
              PATIENT NAME
            </Text>
            <Text className="text-[15px] font-bold text-guardian-text-primary">
              {data.patientLine}
            </Text>
          </View>

          <View className="h-[0.5px] bg-guardian-bg-secondary my-3" />

          <View className="mb-1">
            <Text className="text-[11px] font-bold text-guardian-text-neutral opacity-50 mb-[6px] tracking-wide">
              VISIT TYPE
            </Text>
            <Text className="text-[15px] font-bold text-guardian-text-primary">
              {data.visitTypeDetail}
            </Text>
          </View>
        </View>

        {/* 유의사항 */}
        <View className="bg-guardian-bg-secondary rounded-xl p-[14px] mb-5">
          <Text className="text-[14px] font-bold text-guardian-text-primary mb-[10px]">
            ⓘ 유의사항
          </Text>
          {[
            "승인 결과는 카카오톡 알림톡 또는 '예약 내역'에서 확인 가능합니다.",
            "면회 시간 10분 전까지 원무과 데스크에 방문하여 접수해 주세요.",
            "발열이나 호흡기 증상이 있을 경우 면회가 제한될 수 있습니다.",
          ].map((text, i) => (
            <Text key={i} className="text-[13px] text-guardian-text-neutral leading-5 mb-2">
              • {text}
            </Text>
          ))}
        </View>

        {/* 홈으로 버튼 */}
        <TouchableOpacity
          className="bg-guardian-button-primary py-4 rounded-xl items-center"
          onPress={onHome}
        >
          <Text className="text-guardian-text-primary text-base font-extrabold">
            홈으로 이동
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}