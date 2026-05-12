import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Text from "@/components/Text";

export default function GuardianMainPage({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef(null);

  const fallbackWidth = Dimensions.get("window").width;
  const effectiveWidth = containerWidth || fallbackWidth;
  const galleryWidth = Math.max(0, effectiveWidth - 40);

  const notices = [
    { id: 1, title: "춘계 보호자 간담회 안내", date: "2024.03.28" },
    { id: 2, title: "면회 예약 시스템 점검 안내", date: "2024.03.25" },
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=50",
    "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=1200&q=50",
    "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=50",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=50",
  ];

  useEffect(() => {
    if (!galleryWidth) return;
    const interval = setInterval(() => {
      const nextIndex = currentImage === galleryImages.length - 1 ? 0 : currentImage + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * galleryWidth, animated: true });
      setCurrentImage(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentImage, galleryWidth]);

  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-primary">
      <View
        className="flex-1"
        onLayout={(e) => setContainerWidth(e?.nativeEvent?.layout?.width ?? 0)}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View className="flex-row justify-between items-center px-5 py-4 bg-background-neutral border-b border-guardian-button-secondary">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">🩺</Text>
              <Text className="text-lg font-extrabold text-guardian-text-primary">따숨</Text>
            </View>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => alert("알림 클릭")}>
                <Text className="text-xl">🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuOpen(true)}>
                <Text className="text-xl">☰</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 활동 갤러리 */}
          <View className="mx-5 mt-5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ActivePhotoGallery")}
            >
              <Text className="text-base font-extrabold text-guardian-text-primary mb-3">
                활동 갤러리
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ActivePhotoGallery")}>
              <View className="bg-background-neutral rounded-2xl overflow-hidden">
                <ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    const x = event.nativeEvent.contentOffset.x;
                    setCurrentImage(Math.round(x / galleryWidth));
                  }}
                  scrollEventThrottle={16}
                >
                  {galleryImages.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={{ width: galleryWidth, height: 200 }}
                    />
                  ))}
                </ScrollView>
                <View className="absolute bottom-3 right-3 bg-black/40 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {currentImage + 1} / {galleryImages.length}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 퀵메뉴 */}
          <View className="flex-row justify-between gap-3 mx-5 mt-5">
            {[
              { icon: "📄", label: "보고서 확인", route: "Report" },
              { icon: "📝", label: "동의서 확인", route: "Consent" },
              { icon: "🤝", label: "면회 신청",   route: "VisitApply" },
            ].map(({ icon, label, route }) => (
              <TouchableOpacity
                key={label}
                className="flex-1 bg-background-neutral items-center py-4 rounded-2xl"
                onPress={() => navigation.navigate(route)}
              >
                <Text className="text-2xl">{icon}</Text>
                <Text className="text-xs font-bold text-guardian-text-primary mt-2">
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 식단 */}
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
                  source={{ uri: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80" }}
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

          {/* 공지사항 */}
          <View className="mx-5 mt-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-extrabold text-guardian-text-primary">
                공지사항
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Notice")}>
                <Text className="text-sm font-bold text-guardian-text-secondary">
                  전체보기
                </Text>
              </TouchableOpacity>
            </View>
            {notices.map((notice) => (
              <TouchableOpacity
                key={notice.id}
                className="flex-row justify-between items-center bg-background-neutral px-4 py-4 rounded-2xl mb-2 border border-guardian-button-secondary"
              >
                <View>
                  <Text className="text-sm font-bold text-guardian-text-primary">
                    {notice.title}
                  </Text>
                  <Text className="text-xs text-guardian-text-neutral mt-1">
                    {notice.date}
                  </Text>
                </View>
                <Text className="text-xl text-guardian-text-secondary">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 하단 네비게이션 */}
        <View className="flex-row justify-around bg-background-neutral border-t border-guardian-button-secondary py-3">
          {[
            { icon: "🏠", label: "홈",    route: null,        active: true },
            { icon: "📆", label: "달력",  route: "Calendar" },
            { icon: "💵", label: "수납",  route: "Payment" },
            { icon: "✅", label: "실시간", route: "LiveCheck" },
            { icon: "💬", label: "챗봇",  route: "Chatbot" },
          ].map(({ icon, label, route, active }) => (
            <TouchableOpacity
              key={label}
              className="items-center"
              onPress={() => route && navigation.navigate(route)}
            >
              <Text className="text-xl">{icon}</Text>
              <Text
                className={`text-[10px] font-bold mt-1 ${
                  active
                    ? "text-guardian-text-secondary"
                    : "text-guardian-text-neutral"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 드로어 */}
        {menuOpen && (
          <View className="absolute inset-0 z-50">
            <TouchableOpacity
              className="absolute inset-0 bg-black/50"
              onPress={() => setMenuOpen(false)}
            />
            <View className="absolute right-0 top-0 bottom-0 w-64 bg-background-neutral p-6">
              <Text className="text-lg font-extrabold text-guardian-text-primary mb-6">
                메뉴
              </Text>
              {[
                { label: "마이페이지", onPress: () => { setMenuOpen(false); navigation.navigate("MyPage"); } },
                { label: "설정",      onPress: () => {} },
                { label: "로그아웃",  onPress: () => {} },
              ].map(({ label, onPress }) => (
                <TouchableOpacity
                  key={label}
                  className="py-4 border-b border-guardian-button-secondary"
                  onPress={onPress}
                >
                  <Text className="font-bold text-guardian-text-primary">{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}