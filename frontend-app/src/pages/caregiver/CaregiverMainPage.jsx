import React, { useState } from "react";
import { SafeAreaView, View, ScrollView, TouchableOpacity } from "react-native";
import Text from "@/components/Text";

export default function CaregiverMainPage({ navigation }) {
  const mockPatients = [
    "김태진 (68세) / 502호",
    "이성우 (88세) / 305호",
    "박미정 (74세) / 411호",
  ];
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-caregiver-bg-primary">
      <View className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

          {/* 헤더 */}
          <View className="flex-row justify-between items-center px-5 py-4 bg-background-neutral border-b border-caregiver-button-secondary">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">🏥</Text>
              <Text className="text-lg font-extrabold text-caregiver-text-primary">따숨</Text>
            </View>
            <View className="flex-row gap-4">
              <Text className="text-xl">🔔</Text>
              <Text className="text-xl">☰</Text>
            </View>
          </View>

          {/* 환자 선택 */}
          <View className="mx-4 mt-4">
            <TouchableOpacity
              className="bg-caregiver-button-primary rounded-xl px-4 py-3"
              onPress={() => setPickerOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold">{selectedPatient} ▾</Text>
            </TouchableOpacity>

            {pickerOpen && (
              <View className="bg-background-neutral rounded-xl border border-caregiver-button-secondary mt-1">
                {mockPatients.map((patient) => (
                  <TouchableOpacity
                    key={patient}
                    className="px-4 py-3 border-b border-caregiver-bg-secondary"
                    onPress={() => {
                      setSelectedPatient(patient);
                      setPickerOpen(false);
                    }}
                  >
                    <Text className="text-caregiver-text-primary font-bold">{patient}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 2주 일정 요약 */}
          <View className="mx-4 mt-4">
            <View className="bg-background-neutral rounded-2xl p-4">
              <Text className="font-bold text-caregiver-text-primary mb-3">2주 일정 요약</Text>
              {[
                ["12","13","14","15","16","17","18"],
                ["19","20","21","22","23","24","25"],
              ].map((week, wi) => (
                <View key={wi} className="flex-row justify-between mb-2">
                  {week.map((d) => (
                    <View
                      key={d}
                      className={`w-9 h-9 rounded-lg justify-center items-center ${
                        d === "14" ? "bg-caregiver-button-primary" : "bg-caregiver-bg-secondary"
                      }`}
                    >
                      <Text className={`text-sm font-bold ${
                        d === "14" ? "text-white" : "text-caregiver-text-primary"
                      }`}>
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
              <Text className="text-xs text-caregiver-text-neutral mt-1">● 03/11 09:00 오전 근무</Text>
              <Text className="text-xs text-caregiver-text-neutral mt-1">● 03/14 15:00 휴무</Text>
            </View>
          </View>

          {/* 오늘 중요 일정 */}
          <View className="mx-4 mt-4">
            <Text className="font-bold text-caregiver-text-primary mb-2">오늘 중요 일정</Text>
            {[
              { name: "김태진 (68세)", desc: "수술입력 및 복약 준비 및 금식" },
              { name: "이성우 (88세)", desc: "체계기록 면회" },
            ].map(({ name, desc }) => (
              <View key={name} className="bg-caregiver-bg-secondary rounded-xl p-3 mb-2">
                <Text className="font-bold text-caregiver-text-primary mb-1">{name}</Text>
                <Text className="text-sm text-caregiver-text-neutral">{desc}</Text>
              </View>
            ))}
          </View>

          {/* 퀵메뉴 */}
          <View className="mx-4 mt-4 flex-row justify-between gap-3">
            {[
              { icon: "📋", label: "업무 체크",  route: "CaregiverTaskCheck" },
              { icon: "📂", label: "환자 목록",  route: "CaregiverPatientList" },
              { icon: "🗓️", label: "사진 업로드", route: null },
            ].map(({ icon, label, route }) => (
              <TouchableOpacity
                key={label}
                className="flex-1 bg-background-neutral rounded-2xl items-center py-4"
                onPress={() => route && navigation.navigate(route)}
              >
                <Text className="text-xl">{icon}</Text>
                <Text className="text-xs font-bold text-caregiver-text-primary mt-2">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 오늘의 식단 */}
          <View className="mx-4 mt-4">
            <View className="bg-background-neutral rounded-2xl p-4">
              <Text className="font-bold text-caregiver-text-primary mb-2">오늘의 식단</Text>
              {["메인 메뉴: 전복죽", "계란찜, 시금치 나물, 백김치", "후식용 계절 과일"].map((item) => (
                <Text key={item} className="text-sm text-caregiver-text-neutral">{item}</Text>
              ))}
            </View>
          </View>

          {/* 공지사항 */}
          <View className="mx-4 mt-4">
            <Text className="font-bold text-caregiver-text-primary mb-2">공지사항</Text>
            {[
              { title: "춘계 보호자 간담회 안내",    date: "2024.03.28" },
              { title: "면회 예약 시스템 점검 안내", date: "2024.03.25" },
            ].map(({ title, date }) => (
              <View key={title} className="flex-row justify-between items-center bg-background-neutral rounded-xl px-4 py-3 mb-2 border border-caregiver-bg-secondary">
                <Text className="text-sm font-bold text-caregiver-text-primary">{title}</Text>
                <Text className="text-xs text-caregiver-text-secondary">{date}</Text>
              </View>
            ))}
          </View>

        </ScrollView>

        {/* 하단 네비게이션 */}
        <View className="flex-row justify-around bg-background-neutral border-t border-caregiver-button-secondary py-3">
          {[
            { icon: "🏠", label: "홈",     active: true },
            { icon: "📷", label: "QR 체크" },
            { icon: "🚨", label: "긴급 호출" },
          ].map(({ icon, label, active }) => (
            <TouchableOpacity key={label} className="items-center">
              <Text className="text-xl">{icon}</Text>
              <Text className={`text-[10px] font-bold mt-1 ${
                active ? "text-caregiver-text-primary" : "text-caregiver-text-neutral"
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