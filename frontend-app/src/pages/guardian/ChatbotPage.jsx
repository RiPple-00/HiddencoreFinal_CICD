import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ChatbotPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>TODAY, OCT 24</Text>
        </View>

        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>안녕하세요, 김희수 님</Text>
          <Text style={styles.introDescription}>
            원무과 메디컬 컨시어지 서비스입니다. 무엇을 도와드릴까요?
          </Text>
        </View>

        <View style={styles.leftMessageContainer}>
          <View style={styles.botMessage}>
            <Text style={styles.messageText}>
              안녕하세요! 현재 입원 중이신 702호 병실의 오늘의 일정과 식단,
              그리고 진료비 수납 내역을 확인해 드릴 수 있습니다.
            </Text>
            <Text style={styles.timeText}>오전 10:15</Text>
          </View>
        </View>

        <View style={styles.rightMessageContainer}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>
              오늘 오후에 예정된 검사 일정이 있나요?
            </Text>
            <Text style={styles.userTimeText}>오전 10:16</Text>
          </View>
        </View>

        <View style={styles.leftMessageContainer}>
          <View style={styles.botMessage}>
            <Text style={styles.messageText}>
              네, 오후 2시에 지하 1층 영상의학과에서 MRI 정밀 검사가 예정되어
              있습니다.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.scheduleButton}>
          <Text style={styles.scheduleButtonText}>SCHEDULE DETAIL</Text>
          <View style={styles.scheduleIconWrap}>
            <MaterialIcons name="calendar-month" size={16} color="#2563EB" />
          </View>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickContainer}
        >
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>검사 예약 확인</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>식단 문의</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>병원 시설 안내</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>서류 발급 안내</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  header: {
    height: 72,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D9E4F5",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  dateBadge: {
    alignSelf: "center",
    backgroundColor: "#DDE7FF",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    marginTop: 24,
  },

  dateBadgeText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },

  introContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 28,
  },

  introTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1D4ED8",
    marginBottom: 12,
  },

  introDescription: {
    textAlign: "center",
    color: "#475569",
    lineHeight: 24,
    fontSize: 15,
    paddingHorizontal: 20,
  },

  leftMessageContainer: {
    alignItems: "flex-start",
    marginBottom: 18,
  },

  rightMessageContainer: {
    alignItems: "flex-end",
    marginBottom: 18,
  },

  botMessage: {
    backgroundColor: "#FFFFFF",
    maxWidth: "82%",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  userMessage: {
    backgroundColor: "#0F3EA9",
    maxWidth: "82%",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  messageText: {
    color: "#1E293B",
    fontSize: 15,
    lineHeight: 24,
  },

  userMessageText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 24,
  },

  timeText: {
    color: "#94A3B8",
    marginTop: 10,
    fontSize: 11,
  },

  userTimeText: {
    color: "#DBEAFE",
    marginTop: 10,
    fontSize: 11,
    textAlign: "right",
  },

  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    marginBottom: 20,
  },

  scheduleButtonText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 12,
  },

  scheduleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  quickContainer: {
    paddingBottom: 12,
    gap: 10,
  },

  quickButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  quickButtonText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 14,
  },

  inputWrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingLeft: 18,
  },

  input: {
    flex: 1,
    height: 52,
    color: "#0F172A",
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#0F3EA9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
});