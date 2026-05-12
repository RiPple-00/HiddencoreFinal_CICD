import React from "react";
import { SafeAreaView, View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import Text from "@/components/Text";

function StateButtons({ danger = false }) {
  return (
    <View className="flex-row gap-2">
      <View className={`px-3 py-1 rounded-full border ${
        !danger
          ? "bg-success-secondary border-success-primary"
          : "bg-caregiver-bg-secondary border-caregiver-button-secondary"
      }`}>
        <Text className={`text-xs font-bold ${!danger ? "text-success-primary" : "text-caregiver-text-neutral"}`}>
          정상
        </Text>
      </View>
      <View className={`px-3 py-1 rounded-full border ${
        danger
          ? "bg-error-secondary border-error-primary"
          : "bg-caregiver-bg-secondary border-caregiver-button-secondary"
      }`}>
        <Text className={`text-xs font-bold ${danger ? "text-error-primary" : "text-caregiver-text-neutral"}`}>
          이상
        </Text>
      </View>
    </View>
  );
}

function Row({ label, danger = false, warnText }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-caregiver-bg-secondary">
      <View className="flex-1 mr-3">
        <Text className={`text-sm ${danger ? "text-error-primary" : "text-caregiver-text-primary"}`}>
          {label}
        </Text>
        {warnText && (
          <Text className="text-xs text-error-primary mt-[2px]">{warnText}</Text>
        )}
      </View>
      <StateButtons danger={danger} />
    </View>
  );
}

export default function CaregiverWorkCheckPage({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-caregiver-bg-primary">
      <View className="flex-1">

        {/* 헤더 */}
        <View className="flex-row justify-between items-center px-5 py-4 bg-background-neutral border-b border-caregiver-button-secondary">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-10" onPress={() => navigation.goBack()}>
              <Text className="text-3xl text-caregiver-text-primary">‹</Text>
            </TouchableOpacity>
            <Text className="text-xl">🏥</Text>
            <Text className="text-lg font-extrabold text-caregiver-text-primary">따숨</Text>
          </View>
          <View className="flex-row gap-[14px]">
            <Text className="text-xl">🔔</Text>
            <Text className="text-xl">☰</Text>
          </View>
        </View>

        {/* 환자 스트립 */}
        <View className="flex-row justify-between items-center px-5 py-3 bg-background-neutral border-b border-caregiver-button-secondary">
          <View>
            <Text className="text-base font-bold text-caregiver-text-primary">
              Kim TTa Woo (M/82)
            </Text>
            <Text className="text-xs text-caregiver-text-neutral mt-1">
              591212 · Ward 702 · 72283944
            </Text>
          </View>
          <Text className="text-xl">🪪</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

          {/* 식사 */}
          <View className="mx-4 mt-4">
            <Text className="text-base font-bold text-caregiver-text-primary mb-2">🍴 식사 (Meal)</Text>
            <View className="bg-background-neutral rounded-2xl p-4">
              <Row label="식사 섭취량" />
              <Row label="수분 섭취량" danger />
              <Row label="식욕 변화" />
              <Row label="식사 중 사례 여부" />
            </View>
          </View>

          {/* 위생점검 */}
          <View className="mx-4 mt-4">
            <Text className="text-base font-bold text-caregiver-text-primary mb-2">🧼 위생점검 (Hygiene)</Text>
            <View className="bg-background-neutral rounded-2xl p-4">
              <Row label="침구류 청결도" />
              <Row label="환자 용품 청결" />
              <Row label="목욕 여부" />
            </View>
          </View>

          {/* 상태 안정화 */}
          <View className="mx-4 mt-4">
            <Text className="text-base font-bold text-caregiver-text-primary mb-2">🛡️ 상태 안정화 (Condition)</Text>
            <View className="bg-background-neutral rounded-2xl p-4">
              <Row label="호흡 양상" danger warnText="체크 확인 필요" />
              <Row label="통증 유무" />
              <Row label="낙상 유무" danger />
              <TextInput
                className="border border-caregiver-button-secondary rounded-lg bg-caregiver-bg-primary px-[10px] py-2 text-[13px] text-caregiver-text-primary mt-2"
                placeholder="상세 사유를 입력해주세요 (발생 시각 및 증거 등)"
                placeholderTextColor="#949BA0"
              />
            </View>
          </View>

          {/* 배뇨 및 배변 */}
          <View className="mx-4 mt-4">
            <Text className="text-base font-bold text-caregiver-text-primary mb-2">👣 배뇨 및 배변</Text>
            <View className="bg-background-neutral rounded-2xl p-4">
              <View className="flex-row justify-between items-center py-3 border-b border-caregiver-bg-secondary">
                <Text className="text-sm text-caregiver-text-primary">💧 배뇨 (Urination)</Text>
                <Text className="text-caregiver-text-secondary">⌄</Text>
              </View>
              <View className="flex-row justify-between items-center py-3 border-b border-caregiver-bg-secondary">
                <Text className="text-sm text-caregiver-text-primary">🚻 배변 (Defecation)</Text>
                <Text className="text-caregiver-text-secondary">⌃</Text>
              </View>
              <Row label="횟수" />
              <Row label="상태" />
            </View>
          </View>

        </ScrollView>

        {/* 하단 네비게이션 */}
        <View className="flex-row justify-around bg-background-neutral border-t border-caregiver-button-secondary py-3">
          {[
            { icon: "🏠", label: "홈" },
            { icon: "📷", label: "QR 체크", active: true },
            { icon: "🚨", label: "긴급 호출", danger: true },
          ].map(({ icon, label, active, danger }) => (
            <TouchableOpacity key={label} className="items-center">
              <Text className="text-xl">{icon}</Text>
              <Text className={`text-[10px] font-bold mt-1 ${
                danger  ? "text-error-primary"
                : active ? "text-caregiver-text-primary"
                : "text-caregiver-text-neutral"
              }`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}