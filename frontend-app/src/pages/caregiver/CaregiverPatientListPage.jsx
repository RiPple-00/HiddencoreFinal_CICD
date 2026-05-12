import React, { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, View, ScrollView, TouchableOpacity } from "react-native";
import Text from "@/components/Text";

const patients = [
  { name: "김영희", age: 82, initial: "김", status: "혈압 안정 / 투약 완료", danger: false, mealType: "일반식" },
  { name: "이철수", age: 78, initial: "이", status: "미열 발생 / 관찰 요망", danger: true,  mealType: "저염식" },
  { name: "박정숙", age: 85, initial: "박", status: "취침 중 / 상태 양호",   danger: false, mealType: "연식" },
  { name: "최민호", age: 74, initial: "최", status: "재활 훈련 중",           danger: false, mealType: "당뇨식" },
];

export default function CaregiverPatientListPage() {
  const navigation = useNavigation();
  const [selectedPatientName, setSelectedPatientName] = useState("김영희");

  const selectedPatient = useMemo(
    () => patients.find((p) => p.name === selectedPatientName) ?? patients[0],
    [selectedPatientName]
  );

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

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

          {/* 검색 */}
          <View className="mx-4 mt-4">
            <View className="flex-row items-center gap-2 bg-background-neutral rounded-xl px-4 py-3 border border-caregiver-button-secondary">
              <Text className="text-xl">🔎</Text>
              <Text className="text-caregiver-text-neutral opacity-50">
                환자 성함 또는 병실 호수 검색
              </Text>
            </View>
          </View>

          {/* 층/호실 정보 */}
          <View className="mx-4 mt-4">
            <Text className="text-xs font-bold text-caregiver-text-secondary mb-1">
              CURRENT FLOOR: 4F
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-extrabold text-caregiver-text-primary">402호실</Text>
              <View className="bg-caregiver-bg-secondary px-3 py-1 rounded-full">
                <Text className="text-sm font-bold text-caregiver-text-primary">👥 4/4명</Text>
              </View>
            </View>
          </View>

          {/* 환자 그리드 */}
          <View className="mx-4 mt-3 flex-row flex-wrap gap-3">
            {patients.map((p) => (
              <TouchableOpacity
                key={p.name}
                activeOpacity={0.85}
                className={`w-[47%] bg-background-neutral rounded-2xl p-3 items-center border ${
                  selectedPatientName === p.name
                    ? "border-caregiver-button-primary bg-caregiver-bg-secondary"
                    : "border-caregiver-bg-secondary"
                }`}
                onPress={() => setSelectedPatientName(p.name)}
              >
                {/* 아바타: 위험/정상 색상은 동적이라 inline style 유지 */}
                <View style={{ borderColor: p.danger ? "#ED584C" : "#005E53" }}
                  className="w-14 h-14 rounded-full border-2 justify-center items-center"
                >
                  <View
                    style={{ backgroundColor: p.danger ? "#FEECEB" : "#E6F7ED" }}
                    className="w-11 h-11 rounded-full justify-center items-center"
                  >
                    <Text style={{ color: p.danger ? "#ED584C" : "#005E53" }}
                      className="text-base font-bold"
                    >
                      {p.initial}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm font-bold text-caregiver-text-primary mt-2">
                  {p.name} · {p.age}세
                </Text>
                <Text className={`text-xs mt-1 text-center ${p.danger ? "text-error-primary" : "text-caregiver-text-neutral"}`}>
                  {p.status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 식단 카드 */}
          <View className="mx-4 mt-4">
            <View className="bg-background-neutral rounded-2xl p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-caregiver-text-primary">
                  {selectedPatient.mealType}
                </Text>
                <View className="flex-row gap-2">
                  {["아침", "점심", "저녁"].map((tab) => (
                    <View
                      key={tab}
                      className={`px-3 py-1 rounded-full ${
                        tab === "점심" ? "bg-caregiver-button-primary" : "bg-caregiver-bg-secondary"
                      }`}
                    >
                      <Text className={`text-xs font-bold ${
                        tab === "점심" ? "text-white" : "text-caregiver-text-neutral"
                      }`}>
                        {tab}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="w-16 h-16 bg-caregiver-bg-secondary rounded-xl justify-center items-center">
                  <Text className="text-2xl">🍱</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-caregiver-text-primary">메인 메뉴: 전복죽</Text>
                  <Text className="text-xs text-caregiver-text-neutral mt-1">계란찜, 시금치 나물, 백김치</Text>
                  <Text className="text-xs text-caregiver-text-neutral">후식용 계절 과일</Text>
                  <View className="bg-success-secondary rounded-full px-2 py-1 mt-2 self-start">
                    <Text className="text-xs font-bold text-success-primary">식사 완료 (12:30)</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* 하단 네비게이션 */}
        <View className="flex-row justify-around bg-background-neutral border-t border-caregiver-button-secondary py-3">
          {[
            { icon: "🏠", label: "홈",     active: true },
            { icon: "📷", label: "QR 체크" },
            { icon: "📞", label: "긴급 호출", danger: true },
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