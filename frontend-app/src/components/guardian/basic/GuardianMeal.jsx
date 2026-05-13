import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import Text from "@/components/Text";

export default function GuardianMeal() {
  return (
    <View className="mx-5 mt-5">
      <View className="bg-background-neutral rounded-2xl p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-extrabold text-guardian-text-primary">
            오늘의 식단
          </Text>
          <View className="flex-row gap-2">
            {["아침", "점심", "저녁"].map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`px-3 py-1 rounded-full ${
                  tab === "점심"
                    ? "bg-guardian-button-primary"
                    : "bg-guardian-bg-secondary"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    tab === "점심"
                      ? "text-guardian-text-primary"
                      : "text-guardian-text-neutral"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row gap-3">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
            }}
            className="w-24 h-24 rounded-xl"
          />
          <View className="flex-1 justify-center">
            <Text className="text-sm font-bold text-guardian-text-primary">
              메인 메뉴: 전복죽
            </Text>
            <Text className="text-xs text-guardian-text-neutral mt-1">
              계란찜, 시금치 나물, 백김치
            </Text>
            <Text className="text-xs text-guardian-text-neutral">
              후식용 계절 과일
            </Text>
            <View className="bg-success-secondary px-3 py-1 rounded-full mt-2 self-start">
              <Text className="text-xs font-bold text-success-primary">
                식사 완료 (12:30)
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
