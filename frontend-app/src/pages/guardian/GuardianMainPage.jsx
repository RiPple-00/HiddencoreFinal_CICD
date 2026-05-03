import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { styles } from "../../styles/guardianMain.styles";

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
      const nextIndex =
        currentImage === galleryImages.length - 1 ? 0 : currentImage + 1;

      scrollRef.current?.scrollTo({
        x: nextIndex * galleryWidth,
        animated: true,
      });

      setCurrentImage(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentImage, galleryWidth]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e?.nativeEvent?.layout?.width ?? 0)}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.logoIcon}>🩺</Text>
              <Text style={styles.logoText}>따숨</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => alert("알림 클릭")}>
                <Text style={styles.headerIcon}>🔔</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMenuOpen(true)}>
                <Text style={styles.headerIcon}>☰</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 사진 영역 */}
          <View style={styles.section} >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ActivePhotoGallery")}
            >
              <Text style={styles.sectionTitle}>활동 갤러리</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ActivePhotoGallery")}>
            <View style={styles.galleryCard}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const x = event.nativeEvent.contentOffset.x;
                  const index = Math.round(x / galleryWidth);
                  setCurrentImage(index);
                }}
                scrollEventThrottle={16}
              >
                {galleryImages.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={[styles.galleryImage,  { width: galleryWidth }]}
                  />
                ))}
              </ScrollView>

              <View style={styles.galleryBadge}>
                <Text style={styles.galleryBadgeText}>
                  {currentImage + 1} / {galleryImages.length}
                </Text>
              </View>
            </View>
            </TouchableOpacity>
          </View>

          {/* 퀵메뉴 */}
          <View style={styles.quickMenuWrap}>
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate("Report")}
            >
              <Text style={styles.quickIcon}>📄</Text>
              <Text style={styles.quickText}>보고서 확인</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate("Consent")}>
              <Text style={styles.quickIcon}>📝</Text>
              <Text style={styles.quickText}>동의서 확인</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate("VisitApply")}>
              <Text style={styles.quickIcon}>🤝</Text>
              <Text style={styles.quickText}>면회 신청</Text>
            </TouchableOpacity>
          </View>

          {/* 식단 */}
          <View style={styles.section}>
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.sectionTitleNoMargin}>오늘의 식단</Text>

                <View style={styles.mealTabs}>
                  <TouchableOpacity style={styles.mealTab}>
                    <Text style={styles.mealTabText}>아침</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.mealTab, styles.mealTabActive]}>
                    <Text style={[styles.mealTabText, styles.mealTabTextActive]}>
                      점심
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mealTab}>
                    <Text style={styles.mealTabText}>저녁</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.mealContent}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
                  }}
                  style={styles.mealImage}
                />
                {/*여기는 태우 컴포넌트 받와서 할 예정 */}
                <View style={styles.mealTextWrap}>
                  <Text style={styles.mealMainText}>메인 메뉴: 전복죽</Text>
                  <Text style={styles.mealSubText}>계란찜, 시금치 나물, 백김치</Text>
                  <Text style={styles.mealSubText}>후식용 계절 과일</Text>

                  <View style={styles.doneBadge}>
                    <Text style={styles.doneBadgeText}>식사 완료 (12:30)</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 공지사항 */}
          <View style={styles.section}>
            <View style={styles.noticeHeader}>
              <Text style={styles.sectionTitle}>공지사항</Text>
              <TouchableOpacity>
                <Text style={styles.noticeMore} onPress={() => navigation.navigate("Notice")}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {notices.map((notice) => (
              <TouchableOpacity key={notice.id} style={styles.noticeCard}>
                <View>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.noticeDate}>{notice.date}</Text>
                </View>
                <Text style={styles.noticeArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 하단 메뉴 */}
        {/* 하단 메뉴 */}
        {/* 하단 메뉴 */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>🏠</Text>
            <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>홈</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Calendar")}>
            <Text style={styles.bottomIcon}>📆</Text>
            <Text style={styles.bottomLabel}>달력</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Payment")}>
            <Text style={styles.bottomIcon}>💵</Text>
            <Text style={styles.bottomLabel}>수납</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("LiveCheck")}>
            <Text style={styles.bottomIcon}>✅</Text>
            <Text style={styles.bottomLabel}>실시간</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("Chatbot")}>
            <Text style={styles.bottomIcon}>💬</Text>
            <Text style={styles.bottomLabel}>챗봇</Text>
          </TouchableOpacity>
        </View>

        {menuOpen && (
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.overlayBackground}
              onPress={() => setMenuOpen(false)}
            />

            <View style={styles.drawer}>
              <Text style={styles.drawerTitle}>메뉴</Text>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuOpen(false); navigation.navigate("MyPage");
                }}
              >
                <Text>마이페이지</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem}>
                <Text>설정</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerItem}>
                <Text>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}
