import React from "react";
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import Text from "../../components/Text";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ChatbotPage() {
  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-secondary relative">
      <ScrollView className="flex-1 px-[18px]" showsVerticalScrollIndicator={false}>

        {/* 날짜 뱃지 */}
        <View className="self-center bg-guardian-button-secondary px-4 py-[7px] rounded-full mt-6">
          <Text className="text-guardian-text-primary font-bold text-xs">
            TODAY, OCT 24
          </Text>
        </View>

        {/* 인트로 */}
        <View className="items-center mt-6 mb-7">
          <Text className="text-[32px] font-extrabold text-guardian-text-primary mb-3">
            안녕하세요, 김희수 님
          </Text>
          <Text className="text-center text-guardian-text-neutral leading-6 text-[15px] px-5">
            원무과 메디컬 컨시어지 서비스입니다. 무엇을 도와드릴까요?
          </Text>
        </View>

        {/* 봇 메시지 */}
        <View className="items-start mb-[18px]">
          <View className="bg-background-neutral max-w-[82%] rounded-[22px] px-[18px] py-4">
            <Text className="text-guardian-text-neutral text-[15px] leading-6">
              안녕하세요! 현재 입원 중이신 702호 병실의 오늘의 일정과 식단,
              그리고 진료비 수납 내역을 확인해 드릴 수 있습니다.
            </Text>
            <Text className="text-guardian-text-secondary mt-[10px] text-[11px]">
              오전 10:15
            </Text>
          </View>
        </View>

        {/* 유저 메시지 */}
        <View className="items-end mb-[18px]">
          <View className="bg-guardian-button-primary max-w-[82%] rounded-[22px] px-[18px] py-4">
            <Text className="text-guardian-text-primary text-[15px] leading-6">
              오늘 오후에 예정된 검사 일정이 있나요?
            </Text>
            <Text className="text-guardian-text-primary opacity-60 mt-[10px] text-[11px] text-right">
              오전 10:16
            </Text>
          </View>
        </View>

        {/* 봇 메시지 2 */}
        <View className="items-start mb-[18px]">
          <View className="bg-background-neutral max-w-[82%] rounded-[22px] px-[18px] py-4">
            <Text className="text-guardian-text-neutral text-[15px] leading-6">
              네, 오후 2시에 지하 1층 영상의학과에서 MRI 정밀 검사가 예정되어
              있습니다.
            </Text>
          </View>
        </View>

        {/* 일정 버튼 */}
        <TouchableOpacity className="flex-row items-center self-start gap-2 mb-5">
          <Text className="text-guardian-text-neutral font-bold text-xs">
            SCHEDULE DETAIL
          </Text>
          <View className="w-7 h-7 rounded-full bg-background-neutral justify-center items-center">
            <MaterialIcons name="calendar-month" size={16} color="#F6B308" />
          </View>
        </TouchableOpacity>

        {/* 빠른 질문 버튼 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 12, gap: 10 }}
        >
          {["검사 예약 확인", "식단 문의", "병원 시설 안내", "서류 발급 안내"].map((label) => (
            <TouchableOpacity
              key={label}
              className="bg-background-neutral px-[18px] py-3 rounded-full border border-guardian-button-secondary"
            >
              <Text className="text-guardian-text-primary font-bold text-sm">
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 입력창 */}
      <View className="bg-background-neutral px-4 pt-3 pb-[10px] border-t border-guardian-button-secondary">
        <View className="flex-row items-center bg-guardian-bg-secondary rounded-full pl-[18px]">
          <TextInput
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#949BA0"
            className="flex-1 h-[52px] text-guardian-text-neutral"
          />
          <TouchableOpacity className="w-[46px] h-[46px] rounded-full bg-guardian-button-primary justify-center items-center mr-1">
            <Ionicons name="send" size={20} color="#503115" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}