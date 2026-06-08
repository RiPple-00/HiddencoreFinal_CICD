// frontend-app/src/pages/guardian/ChatbotPage.jsx
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/Text";
import { resolveChatbotUrl } from "@/api";
import { useI18n } from "@/hooks/useI18n";

const API_URL = resolveChatbotUrl();

// ── 지도 이미지 (assets/soldesk.png 에 저장 필요) ───────────
const MAP_IMAGE = require("../../../assets/soldesk.png");

// ── 오시는 길 감지 키워드 ──────────────────────────────────────
const MAP_KEYWORDS = ["오시는 길", "위치", "주소", "종각역", "지하철", "어떻게 가", "찾아가", "교통편", "버스", "길 안내"];
const isDirectionQuery = (text) => MAP_KEYWORDS.some((kw) => text.includes(kw));

// ── 다국어 UI 문자열 ─────────────────────────────────────────
const I18N = {
  ko: {
    title: "따숨 AI 상담사",
    online: "온라인",
    welcome: "안녕하세요! 따숨 요양원 AI 상담사입니다 😊\n위 메뉴를 선택하거나 궁금한 점을 입력해 주세요.",
    reset: "대화가 초기화되었습니다. 무엇을 도와드릴까요? 😊",
    placeholder: "궁금한 점을 입력하세요...",
    error: "일시적인 오류가 발생했습니다. 대표번호 02-6901-7098로 문의해 주세요.",
  },
  en: {
    title: "Thasoom AI Assistant",
    online: "Online",
    welcome: "Hello! I'm the AI assistant of Thasoom Nursing Home 😊\nSelect a menu or type your question.",
    reset: "Conversation reset. How can I help you? 😊",
    placeholder: "Type your question here...",
    error: "A temporary error occurred. Please contact 02-6901-7098.",
  },
  ja: {
    title: "따숨 AIアシスタント",
    online: "オンライン",
    welcome: "こんにちは！따숨 療養院のAIアシスタントです 😊\nメニューを選択するか、ご質問を入力してください。",
    reset: "会話がリセットされました。何かお手伝いできますか？😊",
    placeholder: "ご質問を入力してください...",
    error: "一時的なエラーが発生しました。代表番号 02-6901-7098 へお問い合わせください。",
  },
};

// ── 카테고리 + 소항목 데이터 ───────────────────────────────────
// question은 RAG 검색 정확도를 위해 한국어 고정, label은 다국어
const CATEGORIES_BASE = [
  {
    id: 1, icon: "🏥", bg: "#E8F5EE", accent: "#2E7D4F",
    labels: { ko: "요양원 안내", en: "Facility Info", ja: "施設案内" },
    subs: [
      { labels: { ko: "시설 소개",   en: "Facility Overview", ja: "施設紹介" },   question: "따숨 요양원 시설을 소개해 주세요" },
      { labels: { ko: "오시는 길",   en: "Directions",        ja: "アクセス" },    question: "오시는 길 안내해 주세요" },
      { labels: { ko: "주요 연락처", en: "Key Contacts",      ja: "主な連絡先" }, question: "주요 연락처를 알려주세요" },
    ],
  },
  {
    id: 2, icon: "🅿️", bg: "#E3F2FD", accent: "#1565C0",
    labels: { ko: "주차 안내",  en: "Parking Info",   ja: "駐車場案内" },
    subs: [
      { labels: { ko: "주차 요금",  en: "Parking Fee",         ja: "駐車料金" },  question: "주차 요금이 얼마인가요?" },
      { labels: { ko: "높이 제한",  en: "Height Limit",        ja: "高さ制限" },  question: "차량 높이 제한이 어떻게 되나요?" },
      { labels: { ko: "차량 등록",  en: "Vehicle Registration", ja: "車両登録" }, question: "차량 등록 방법을 알려주세요" },
      { labels: { ko: "전기차 충전", en: "EV Charging",         ja: "EV充電" },   question: "전기차 충전 구역은 어디 있나요?" },
    ],
  },
  {
    id: 3, icon: "📄", bg: "#F3E5F5", accent: "#6A1B9A",
    labels: { ko: "서류 안내",  en: "Documents",    ja: "書類案内" },
    subs: [
      { labels: { ko: "무방문 발급",  en: "Remote Issuance",    ja: "非来館発行" }, question: "무방문으로 서류를 발급받으려면 어떻게 하나요?" },
      { labels: { ko: "방문 발급",    en: "In-person Issuance", ja: "来館発行" },   question: "방문해서 서류를 발급받으려면 어떻게 하나요?" },
      { labels: { ko: "증명서 발급",  en: "Certificate",        ja: "証明書発行" }, question: "증명서 발급 방법을 알려주세요" },
      { labels: { ko: "의무기록사본", en: "Medical Records",    ja: "診療記録" },   question: "의무기록사본은 어떻게 발급받나요?" },
    ],
  },
  {
    id: 4, icon: "🏨", bg: "#E0F2F1", accent: "#00695C",
    labels: { ko: "원무",        en: "Administration", ja: "事務" },
    subs: [
      { labels: { ko: "퇴원 서비스", en: "Discharge Services",   ja: "退院サービス" }, question: "퇴원환자 서비스에는 어떤 것이 있나요?" },
      { labels: { ko: "퇴원 절차",   en: "Discharge Process",    ja: "退院手続き" },   question: "퇴원 절차를 알려주세요" },
      { labels: { ko: "면회 신청",   en: "Visit Application",    ja: "面会申請" },     question: "면회 신청은 어떻게 하나요?" },
      { labels: { ko: "면회 시간",   en: "Visit Hours",          ja: "面会時間" },     question: "면회 시간이 어떻게 되나요?" },
      { labels: { ko: "입원 절차",   en: "Admission Process",    ja: "入院手続き" },   question: "입원 절차를 알려주세요" },
      { labels: { ko: "원무팀 전화", en: "Admin Phone",          ja: "事務連絡先" },   question: "원무팀 전화번호를 알려주세요" },
    ],
  },
  {
    id: 5, icon: "🩺", bg: "#FFF3E0", accent: "#E65100",
    labels: { ko: "입원 준비",   en: "Admission Prep", ja: "入院準備" },
    subs: [
      { labels: { ko: "입원 준비물", en: "What to Bring",      ja: "入院持ち物" }, question: "입원 시 준비물이 뭔가요?" },
      { labels: { ko: "보호자 준비", en: "Guardian Info",      ja: "家族の準備" }, question: "보호자 준비사항을 알려주세요" },
      { labels: { ko: "입원 시간",   en: "Admission Hours",    ja: "入院時間" },   question: "입원 가능 시간이 언제인가요?" },
      { labels: { ko: "응급 입원",   en: "Emergency Admission", ja: "緊急入院" },  question: "응급 입원은 가능한가요?" },
    ],
  },
];

// ── 유틸 ───────────────────────────────────────────────────────
const formatTime = () => {
  const d = new Date();
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0");
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${m}`;
};

// ── 타이핑 애니메이션 ──────────────────────────────────────────
const TypingBubble = () => {
  const dots = [useRef(new Animated.Value(0)).current,
                useRef(new Animated.Value(0)).current,
                useRef(new Animated.Value(0)).current];
  React.useEffect(() => {
    dots.forEach((dot, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 150),
        Animated.timing(dot, { toValue: -5, duration: 280, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0,  duration: 280, useNativeDriver: true }),
        Animated.delay(500),
      ])).start()
    );
  }, []);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 16 }}>
      <BotAvatar />
      <View style={{ backgroundColor: "#F0F0F0", borderRadius: 20, borderBottomLeftRadius: 4,
                     paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row", gap: 5 }}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4,
            backgroundColor: "#999", transform: [{ translateY: dot }] }} />
        ))}
      </View>
    </View>
  );
};

// ── 봇 아바타 ──────────────────────────────────────────────────
const BotAvatar = () => (
  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#2E7D4F",
    justifyContent: "center", alignItems: "center", marginRight: 8, marginTop: 2 }}>
    <MaterialCommunityIcons name="hospital-box-outline" size={17} color="#fff" />
  </View>
);

// ── 지도 카드 ──────────────────────────────────────────────────
const MapCard = () => (
  <View style={{ marginTop: 10, borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "#E0E0E0" }}>
    <Image source={MAP_IMAGE} style={{ width: "100%", height: 180 }} resizeMode="cover" />
    <View style={{ backgroundColor: "#F8FBF9", padding: 10 }}>
      <Text style={{ fontSize: 12, color: "#2E7D4F", fontWeight: "700", marginBottom: 3 }}>
        📍 따숨 요양원
      </Text>
      <Text style={{ fontSize: 11, color: "#555", lineHeight: 17 }}>
        서울특별시 종로구 종로12길 15{"\n"}
        지하철 1호선 종각역 4번 출구 도보 5분
      </Text>
    </View>
  </View>
);

// ── 메시지 버블 ────────────────────────────────────────────────
const MessageBubble = React.memo(({ item }) => {
  const isUser = item.role === "user";
  if (item.role === "typing") return <TypingBubble />;

  return (
    <View style={{ flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end", marginBottom: 16 }}>
      {!isUser && <BotAvatar />}
      <View style={{ maxWidth: "78%", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <View style={{
          backgroundColor: isUser ? "#2E7D4F" : "#F0F0F0",
          borderRadius: 20,
          borderBottomRightRadius: isUser ? 4 : 20,
          borderBottomLeftRadius: isUser ? 20 : 4,
          paddingHorizontal: 15, paddingVertical: 11,
        }}>
          <Text style={{ color: isUser ? "#fff" : "#1A1A1A", fontSize: 14, lineHeight: 21 }}>
            {item.content}
          </Text>
          {/* 오시는 길 지도 */}
          {!isUser && item.showMap && <MapCard />}
        </View>
        {item.time && (
          <Text style={{ color: "#BBBBBB", fontSize: 10, marginTop: 3, marginHorizontal: 4 }}>
            {item.time}
          </Text>
        )}
      </View>
    </View>
  );
});

// ══════════════════════════════════════════════════════════════
//  메인 페이지
// ══════════════════════════════════════════════════════════════
export default function ChatbotPage() {
  const { language } = useI18n();
  const lang = I18N[language] ?? I18N.ko;
  const CATEGORIES = CATEGORIES_BASE.map((cat) => ({
    ...cat,
    label: cat.labels[language] ?? cat.labels.ko,
    subs: cat.subs.map((sub) => ({
      ...sub,
      label: sub.labels[language] ?? sub.labels.ko,
    })),
  }));

  const [messages, setMessages] = useState([{
    id: "0", role: "assistant", time: formatTime(),
    content: lang.welcome,
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);   // 선택된 카테고리
  const flatListRef = useRef(null);
  const historyRef  = useRef([{ role: "assistant", content: lang.welcome }]);
  const subAnim     = useRef(new Animated.Value(0)).current;

  const scrollToBottom = useCallback(() =>
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80), []);

  // 카테고리 버튼 클릭
  const selectCategory = useCallback((cat) => {
    if (selectedCat?.id === cat.id) {
      setSelectedCat(null);
      Animated.timing(subAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    } else {
      setSelectedCat(cat);
      Animated.spring(subAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    }
  }, [selectedCat]);

  // 메시지 전송
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isLoading) return;
    setInput("");
    setSelectedCat(null);

    const showMap = isDirectionQuery(trimmed);

    const userMsg = { id: Date.now().toString(), role: "user", content: trimmed, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current = [...historyRef.current, { role: "user", content: trimmed }];
    scrollToBottom();

    setIsLoading(true);
    setMessages((prev) => [...prev, { id: "typing", role: "typing" }]);
    scrollToBottom();

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyRef.current, language }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}${errBody ? `: ${errBody.slice(0, 120)}` : ""}`);
      }
      const data = await res.json();

      const botMsg = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: data.reply, time: formatTime(),
        showMap: showMap || isDirectionQuery(data.reply),
      };
      historyRef.current = [...historyRef.current, { role: "assistant", content: data.reply }];
      setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botMsg]);
    } catch (e) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error("[chatbot] request failed", API_URL, e?.message ?? e);
      }
      const hint =
        e?.message?.includes("Network request failed") ||
        e?.message?.includes("Failed to fetch")
          ? `\n\n(챗봇 서버 ${API_URL} 에 연결되지 않습니다. PC에서 python chatbot.py 실행 및 .env OPENAI_API_KEY 확인)`
          : "";
      setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), {
        id: (Date.now() + 1).toString(), role: "assistant", time: formatTime(),
        content: lang.error + hint,
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [input, isLoading, scrollToBottom]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>

        {/* ── 헤더 ──────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18,
          paddingTop: 14, paddingBottom: 12, backgroundColor: "#fff",
          borderBottomWidth: 1, borderBottomColor: "#F0F0F0", gap: 11 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#2E7D4F",
            justifyContent: "center", alignItems: "center" }}>
            <MaterialCommunityIcons name="hospital-box-outline" size={21} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>{lang.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" }} />
              <Text style={{ fontSize: 10, color: "#22C55E" }}>{lang.online}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => {
            const msg = { id: Date.now().toString(), role: "assistant", time: formatTime(),
              content: lang.reset };
            setMessages([msg]);
            historyRef.current = [{ role: "assistant", content: msg.content }];
            setSelectedCat(null);
          }} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#F5F5F5",
            justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="refresh-outline" size={17} color="#666" />
          </TouchableOpacity>
        </View>

        {/* ── 카테고리 버튼 (2줄) ───────────────────────────── */}
        <View style={{ backgroundColor: "#fff", paddingBottom: 10,
          borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}>

          {/* 1줄: 요양원 안내 / 주차 안내 / 서류 안내 */}
          <View style={{ flexDirection: "row", paddingHorizontal: 14, paddingTop: 10, gap: 7 }}>
            {CATEGORIES.slice(0, 3).map((cat) => {
              const isActive = selectedCat?.id === cat.id;
              return (
                <TouchableOpacity key={cat.id} onPress={() => selectCategory(cat)}
                  activeOpacity={0.75}
                  style={{
                    flex: 1, flexDirection: "row", alignItems: "center",
                    justifyContent: "center", gap: 4,
                    paddingVertical: 8, borderRadius: 22,
                    backgroundColor: isActive ? cat.accent : cat.bg,
                    borderWidth: 1.5,
                    borderColor: isActive ? cat.accent : "transparent",
                  }}>
                  <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: "700",
                    color: isActive ? "#fff" : cat.accent }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2줄: 원무 / 입원 준비 */}
          <View style={{ flexDirection: "row", paddingHorizontal: 14, paddingTop: 7, gap: 7 }}>
            {CATEGORIES.slice(3, 5).map((cat) => {
              const isActive = selectedCat?.id === cat.id;
              return (
                <TouchableOpacity key={cat.id} onPress={() => selectCategory(cat)}
                  activeOpacity={0.75}
                  style={{
                    flex: 1, flexDirection: "row", alignItems: "center",
                    justifyContent: "center", gap: 4,
                    paddingVertical: 8, borderRadius: 22,
                    backgroundColor: isActive ? cat.accent : cat.bg,
                    borderWidth: 1.5,
                    borderColor: isActive ? cat.accent : "transparent",
                  }}>
                  <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: "700",
                    color: isActive ? "#fff" : cat.accent }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 소항목 칩 */}
          {selectedCat && (
            <Animated.View style={{ opacity: subAnim,
              transform: [{ translateY: subAnim.interpolate({ inputRange: [0,1], outputRange: [-8, 0] }) }] }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, gap: 7 }}>
                {selectedCat.subs.map((sub) => (
                  <TouchableOpacity key={sub.label}
                    onPress={() => sendMessage(sub.question)}
                    activeOpacity={0.75}
                    style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 18,
                      backgroundColor: "#fff", borderWidth: 1.5, borderColor: selectedCat.accent }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: selectedCat.accent }}>
                      {sub.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </View>

        {/* ── 메시지 리스트 ──────────────────────────────────── */}
        <FlatList ref={flatListRef} data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 18, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* ── 입력창 ─────────────────────────────────────────── */}
        <View style={{ backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F0F0F0",
          paddingHorizontal: 14, paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 12 : 14,
          flexDirection: "row", alignItems: "center", gap: 9 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center",
            backgroundColor: "#F5F5F5", borderRadius: 26, paddingHorizontal: 16, minHeight: 50 }}>
            <TextInput value={input} onChangeText={setInput}
              placeholder={lang.placeholder} placeholderTextColor="#BBBBBB"
              style={{ flex: 1, fontSize: 14, color: "#1A1A1A", paddingVertical: 8 }}
              multiline maxLength={300}
              onSubmitEditing={() => sendMessage()} returnKeyType="send" blurOnSubmit />
          </View>
          <TouchableOpacity onPress={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
            style={{ width: 48, height: 48, borderRadius: 24,
              backgroundColor: input.trim() && !isLoading ? "#2E7D4F" : "#E0E0E0",
              justifyContent: "center", alignItems: "center" }}>
            {isLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={19} color="#fff" />}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}