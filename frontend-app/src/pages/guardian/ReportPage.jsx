import React, { useState } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import Text from "../../components/Text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const dailyRates = [
  { day: "월", rate: 75 },
  { day: "화", rate: 90 },
  { day: "수", rate: 70 },
  { day: "목", rate: 80 },
  { day: "금", rate: 95 },
  { day: "토", rate: 85 },
  { day: "일", rate: 82 },
];

const checklistData = [
  {
    label: "식사 도움",
    percent: "70%",
    percentStyle: "warn",
    dailyComments: ["반찬 거부 있음","정상 섭취","반찬 거부 있음","정상 섭취","죽으로 대체","정상 섭취","-"],
  },
  {
    label: "개인 위생 관리",
    percent: "100%",
    percentStyle: "success",
    dailyComments: ["-","-","-","-","-","-","-"],
  },
  {
    label: "배변 관리",
    percent: "60%",
    percentStyle: "danger",
    dailyComments: ["변비 증세 관찰","정상","변비 증세 관찰","변비 증세 관찰","정상","-","-"],
  },
];

export default function ReportPage() {
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (index) =>
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-secondary">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="flex-row justify-between items-center mt-[10px] mb-[18px]">
          <Text className="text-xl font-bold text-guardian-text-primary">정기 보고서</Text>
        </View>

        {/* 환자 카드 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <View className="flex-row items-center">
            <View className="w-[70px] h-[70px] rounded-full bg-guardian-button-secondary" />

            <View className="flex-1 ml-[14px]">
              <Text className="text-xl font-bold text-guardian-text-primary mb-[6px]">
                김OO 어르신
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="document-text-outline" size={14} color="#503115" />
                <Text className="text-[13px] text-guardian-text-neutral">2024.05.01~</Text>
              </View>
              <Text className="text-[13px] text-guardian-text-neutral mt-[3px]">
                2024.05.07
              </Text>
              <View className="mt-[10px] bg-guardian-button-secondary self-start rounded-full px-[10px] py-[5px]">
                <Text className="text-xs text-guardian-text-primary font-bold">주간 보고서</Text>
              </View>
            </View>

            <View className="w-[90px] h-[90px] rounded-2xl border border-error-primary justify-center items-center bg-error-secondary">
              <MaterialCommunityIcons name="alert-outline" size={28} color="#ED584C" />
              <Text className="mt-[6px] text-error-primary font-bold text-base">주의</Text>
            </View>
          </View>
        </View>

        {/* AI 분석 요약 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-guardian-text-primary">✨ AI 분석 요약</Text>
          </View>

          <Text className="text-[14px] leading-[22px] text-guardian-text-neutral mb-[18px]">
            이번 주 동안 어르신의 건강 데이터와 기록을 종합 분석한 결과,
            전반적인 상태는 주의가 필요한 수준으로 확인되었습니다.
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {[
              { emoji: "🍽️", title: "식사",    desc: "70% 달성" },
              { emoji: "🪥",  title: "위생",    desc: "완벽 관리" },
              { emoji: "🚻",  title: "배변",    desc: "변비 증상" },
              { emoji: "🟩",  title: "환자 상태", desc: "안정" },
            ].map(({ emoji, title, desc }) => (
              <View key={title} className="w-[48%] bg-guardian-bg-secondary rounded-2xl py-[18px] items-center mb-3">
                <Text className="text-[22px]">{emoji}</Text>
                <Text className="mt-2 font-bold text-guardian-text-primary">{title}</Text>
                <Text className="mt-1 text-[13px] text-guardian-text-neutral">{desc}</Text>
              </View>
            ))}
          </View>

          {/* AI 코멘트 */}
          <View className="bg-guardian-button-secondary rounded-[14px] p-[14px] mt-[6px]">
            <Text className="text-guardian-text-primary font-bold mb-[10px]">💡 AI 분석 코멘트</Text>

            {[
              { bullet: "🍽️", text: "이번 주 ", bold: "반찬 거부가 월·수요일에 반복", rest: "되었습니다. 부드러운 유동식 위주로 식단을 조정하고, 선호 반찬을 파악해 자발적 섭취를 유도해 주세요." },
              { bullet: "🚻", text: "", bold: "월·수·목 3일간 변비 증세", rest: "가 관찰되었습니다. 수분 섭취량을 늘리고 가벼운 복부 마사지를 권장드립니다. 증세가 지속될 경우 의료진에게 보고해 주세요." },
              { bullet: "📈", text: "금·토요일에는 컨디션이 회복되는 흐름이 확인됩니다.", bold: " 위생 관리 루틴은 이번 주 내내 양호", rest: "하게 유지되었으니 지속해 주세요." },
            ].map(({ bullet, text, bold, rest }, i) => (
              <View key={i} className="flex-row gap-2 mb-[10px]">
                <Text className="text-[14px] mt-[1px]">{bullet}</Text>
                <Text className="flex-1 text-guardian-text-neutral leading-5 text-[13px]">
                  {text}
                  <Text className="font-bold text-guardian-text-primary">{bold}</Text>
                  {rest}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 체크리스트 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-guardian-text-primary">
              1. 요양사 체크리스트 요약
            </Text>
            <Text className="text-guardian-text-secondary text-2xl font-extrabold">82%</Text>
          </View>

          {/* 수행률 원 */}
          <View className="w-[130px] h-[130px] rounded-full border-[10px] border-guardian-button-primary justify-center items-center self-center my-5">
            <Text className="text-[28px] font-extrabold text-guardian-text-primary">82%</Text>
            <Text className="text-guardian-text-neutral">수행률</Text>
          </View>

          {/* 일별 수행률 */}
          <View className="mb-4">
            <Text className="text-[14px] font-bold text-guardian-text-primary mb-3">
              📊 일별 수행률 추이
            </Text>
            <View className="flex-row justify-between items-end h-[100px] bg-guardian-bg-secondary rounded-[14px] px-[10px] pt-[10px]">
              {dailyRates.map((item) => {
                const barColor =
                  item.rate >= 90 ? "#34A853"
                  : item.rate >= 75 ? "#FCC101"
                  : "#ED584C";
                return (
                  <View key={item.day} className="flex-1 items-center justify-end h-full">
                    <Text className="text-[9px] text-guardian-text-neutral mb-1 font-bold">
                      {item.rate}%
                    </Text>
                    <View className="w-4 h-[60px] bg-guardian-button-secondary rounded-lg justify-end overflow-hidden">
                      <View style={{ width: "100%", height: `${item.rate}%`, backgroundColor: barColor, borderRadius: 8 }} />
                    </View>
                    <Text className="mt-[6px] mb-2 text-xs font-bold text-guardian-text-neutral">
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View className="flex-row gap-3 mt-[10px]">
              <Text className="text-[11px] text-guardian-text-neutral">🟢 90% 이상</Text>
              <Text className="text-[11px] text-guardian-text-neutral">🟡 75~89%</Text>
              <Text className="text-[11px] text-guardian-text-neutral">🔴 75% 미만</Text>
            </View>
          </View>

          {/* 테이블 */}
          <View className="mt-[10px]">
            {checklistData.map((item, index) => {
              const isExpanded = !!expandedRows[index];
              const uniqueComments = [...new Set(item.dailyComments.filter((c) => c !== "-"))];
              const summaryComment =
                uniqueComments.length === 0 ? "-"
                : uniqueComments.length === 1 ? uniqueComments[0]
                : `${uniqueComments[0]} 외 ${uniqueComments.length - 1}건`;
              const hasMultiple =
                uniqueComments.length > 1 ||
                (uniqueComments.length === 1 && item.dailyComments.some((c) => c === "-"));

              const percentClass =
                item.percentStyle === "success" ? "text-success-primary font-bold"
                : item.percentStyle === "warn"    ? "text-guardian-text-secondary font-bold"
                : "text-error-primary font-bold";

              return (
                <View key={index}>
                  <TouchableOpacity
                    className="flex-row justify-between py-3 border-b border-guardian-bg-secondary"
                    onPress={() => toggleRow(index)}
                    activeOpacity={0.7}
                  >
                    <Text className="flex-1 text-guardian-text-primary">{item.label}</Text>
                    <Text className={percentClass}>{item.percent}</Text>
                    <View className="flex-1 flex-row justify-end items-center gap-1">
                      <Text className="text-right text-guardian-text-neutral text-xs" numberOfLines={1}>
                        {summaryComment}
                      </Text>
                      {hasMultiple && (
                        <Text className="text-[10px] text-guardian-text-neutral">
                          {isExpanded ? "▲" : "▼"}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="bg-guardian-bg-secondary rounded-xl px-[14px] py-[10px] mb-1 gap-[6px]">
                      {DAYS.map((day, di) => (
                        <View key={di} className="flex-row items-center gap-3">
                          <Text className="w-5 text-[13px] font-bold text-guardian-text-secondary">
                            {day}
                          </Text>
                          <Text className={`text-[13px] flex-1 ${item.dailyComments[di] === "-" ? "text-guardian-button-primary opacity-40" : "text-guardian-text-neutral"}`}>
                            {item.dailyComments[di]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* 의료진 소견 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <Text className="text-lg font-bold text-guardian-text-primary">2. 의료진 소견 요약</Text>

          <View className="flex-row items-center mt-4 mb-[18px]">
            <View className="w-[60px] h-[60px] rounded-full bg-guardian-button-secondary mr-[14px]" />
            <View className="flex-1">
              <Text className="font-bold text-guardian-text-primary mb-1">김완치 주치의</Text>
              <Text className="text-[15px] font-bold text-guardian-text-neutral leading-[22px]">
                "식단 조정 및 수분 섭취 집중 관리 필요"
              </Text>
            </View>
          </View>

          {[
            {
              label: "건강 상태",
              value: null,
              badge: true,
            },
            { label: "주요 소견", value: "소화 기능 저하로 인한 식욕 부진" },
            { label: "복용 약물", value: "위장 보호제 1종 추가 처방" },
          ].map(({ label, value, badge }) => (
            <View key={label} className="flex-row justify-between mb-[14px] items-center">
              <Text className="text-guardian-text-neutral font-bold">{label}</Text>
              {badge ? (
                <View className="bg-guardian-button-secondary rounded-full px-[10px] py-[5px]">
                  <Text className="text-guardian-text-primary font-bold text-xs">주의 관찰</Text>
                </View>
              ) : (
                <Text className="flex-1 text-right text-guardian-text-primary ml-5">{value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* 프로그램 활동 */}
        <View className="bg-background-neutral rounded-[20px] p-[18px] mb-[18px]">
          <Text className="text-lg font-bold text-guardian-text-primary">
            3. 프로그램 활동 및 증진 효과
          </Text>

          <View className="bg-guardian-bg-secondary rounded-2xl p-4 mt-4">
            <Text className="font-bold text-guardian-text-primary mb-2">실내 가드닝 활동</Text>
            <Text className="text-guardian-text-neutral leading-5">
              작은 식물을 심고 물을 주며 소근육 자극 및 심리적 안정감을 도와주었습니다.
            </Text>
          </View>

          {[
            { title: "신체 기능 개선", desc: "소근육 조절 능력 및 손가락 민첩성 향상 관찰" },
            { title: "정서적 안정",   desc: "식물과의 교감을 통해 심리적 평온함 유지 및 사회적 유대감 형성" },
          ].map(({ title, desc }) => (
            <View key={title} className="bg-guardian-bg-secondary rounded-[14px] p-[14px] mt-[14px]">
              <Text className="font-bold text-guardian-text-primary mb-[6px]">{title}</Text>
              <Text className="text-guardian-text-neutral leading-5">{desc}</Text>
            </View>
          ))}

          {/* AI 추천 */}
          <View className="bg-success-secondary rounded-[14px] p-[14px] mt-4"
            style={{ borderLeftWidth: 3, borderLeftColor: "#34A853" }}
          >
            <Text className="text-success-primary font-bold text-[14px] mb-3">
              🧠 AI 다음 주 프로그램 추천
            </Text>
            {[
              { bullet: "🧘", label: "신체 기능 강화", desc: "소화 기능 저하로 식욕이 감소된 상태입니다. 눈서르게 누워서 하는 스트레칭이나 업다운동작 위주의 활동으로 신체 스트레스를 줄이면 식욕 회복에 도움이 될 수 있습니다." },
              { bullet: "🎨", label: "인지 자극",     desc: "간단한 색칠화 또는 백일장 쓰기 활동을 추가하면 인지 자극과 집중력 유지에 효과적입니다." },
              { bullet: "🍺", label: "소화 지원",     desc: "변비 증세가 반복되고 있어 가벼운 복부 마사지, 수분 보충 활동 등을 프로그램에 포함하면 좋겠습니다." },
            ].map(({ bullet, label, desc }, i, arr) => (
              <View key={label} className={`flex-row gap-[10px] ${i < arr.length - 1 ? "mb-3" : ""}`}>
                <Text className="text-[18px] mt-[1px]">{bullet}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-guardian-text-primary text-[13px] mb-[3px]">{label}</Text>
                  <Text className="text-[13px] text-guardian-text-neutral leading-5">{desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}