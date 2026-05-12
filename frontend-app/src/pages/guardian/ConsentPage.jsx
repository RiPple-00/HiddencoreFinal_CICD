import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const BLUE = "#1D4ED8";
const BG = "#F8FAFC";
const SLATE_700 = "#334155";
const SLATE_600 = "#475569";
const SLATE_500 = "#64748B";

const FAQ_ITEMS = [
  "수술 시간은 총 얼마나 소요되나요?",
  "수술 중 보호자는 어디에 대기하나요?",
  "준비해야 할 서류가 따로 있나요?",
];

export default function ConsentPage({ navigation }) {
  const [q1Understood, setQ1Understood] = useState(false);
  const [showGeneralAnesthesiaNote, setShowGeneralAnesthesiaNote] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBack}
        >
          <Ionicons name="chevron-back" size={24} color={BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>동의서 확인</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>환자 권리 및 수술 동의</Text>
        <Text style={styles.intro}>
          수술 전 꼭 확인해야 할 항목입니다.{"\n"}
          각 문항의 설명을 읽으시고, 파란색으로 표시된 용어를 눌러 상세 안내를 확인해 주세요.
        </Text>

        {/* Q1 */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <View style={styles.docIconWrap}>
              <Ionicons name="document-text-outline" size={22} color={BLUE} />
            </View>
          </View>
          <Text style={styles.question}>Q1. 마취 방식은 어떻게 결정되나요?</Text>
          <Text style={styles.answer}>
            수술 부위·종류와 환자의 전신 상태를 종합해 마취과에서 판단합니다. 필요 시{" "}
            <Text
              style={styles.linkInline}
              onPress={() => setShowGeneralAnesthesiaNote((v) => !v)}
            >
              전신 마취
            </Text>
            , 부위 마취, 신경차단 마취 등이 선택될 수 있습니다.
          </Text>
          {showGeneralAnesthesiaNote ? (
            <View style={styles.infoBoxAccent}>
              <Text style={styles.infoBoxText}>
                전신 마취는 의식과 통증을 일시적으로 없애 전신을 안전하게 관리하는 마취
                방식입니다. 환자 상태에 따라 마취 계획은 달라질 수 있습니다.
              </Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.q1Btn, q1Understood && styles.q1BtnDone]}
            onPress={() => setQ1Understood((p) => !p)}
            activeOpacity={0.85}
          >
            <Text style={[styles.q1BtnText, q1Understood && styles.q1BtnTextDone]}>
              이해했습니다
            </Text>
          </TouchableOpacity>
        </View>

        {/* Q2 */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <View style={styles.docIconWrap}>
              <Ionicons name="document-text-outline" size={22} color={BLUE} />
            </View>
          </View>
          <Text style={styles.question}>Q2. 수술 후 회복 과정은 어떻게 되나요?</Text>
          <Text style={styles.answer}>
            수술 직후에는 회복실에서 상태를 관찰한 뒤, 병실로 이동하여 단계별로 회복
            일정과 주의사항을 안내해 드립니다. 담당 의료진의 지시에 따라 진행됩니다.
          </Text>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => Alert.alert("안내", "회복 타임라인은 병원 안내에 따라 달라질 수 있습니다.")}
            activeOpacity={0.85}
          >
            <Ionicons name="information-circle-outline" size={20} color={SLATE_600} />
            <Text style={styles.outlineBtnText}>회복 타임라인 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => Alert.alert("안내", "재활 프로그램은 진단과 회복 정도에 맞춰 별도 안내됩니다.")}
            activeOpacity={0.85}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={SLATE_600} />
            <Text style={styles.outlineBtnText}>재활 프로그램 확인</Text>
          </TouchableOpacity>
        </View>

        {/* Q3 */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <View style={styles.docIconWrap}>
              <Ionicons name="document-text-outline" size={22} color={BLUE} />
            </View>
          </View>
          <Text style={styles.question}>Q3. 동의 후에도 거부할 권리가 있나요?</Text>
          <Text style={styles.answer}>
            네. 동의하셨더라도 수술 전까지는 언제든지{" "}
            <Text
              style={styles.linkInline}
              onPress={() =>
                Alert.alert(
                  "동의 철회",
                  "동의 철회는 수술 전까지 가능하며, 불이익 없이 다른 치료 옵션을 논의하실 수 있습니다.",
                )
              }
            >
              결정을 철회
            </Text>
            하실 수 있으며, 이로 인한 불이익은 없습니다.
          </Text>
        </View>

        {/* 서명 */}
        <View style={styles.signCard}>
          <View style={styles.signHeaderRow}>
            <View style={styles.shieldIcon}>
              <Ionicons name="shield-checkmark" size={26} color={BLUE} />
            </View>
            <View style={styles.signHeaderText}>
              <Text style={styles.signTitle}>서명 준비 완료</Text>
              <Text style={styles.signDesc}>
                아래 전자 서명 영역을 눌러 서명을 시작한 뒤, 동의를 완료해 주세요.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signPad}
            activeOpacity={0.9}
            onPress={() => Alert.alert("전자 서명", "실제 연동 시 서명 패드가 열립니다.")}
          >
            <Feather name="edit-3" size={22} color="rgba(255,255,255,0.95)" />
            <Text style={styles.signPadText}>전자 서명 영역 (클릭하여 시작)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signSubmit}
            activeOpacity={0.9}
            onPress={() => Alert.alert("동의", "동의 및 서명이 완료되었습니다.")}
          >
            <Text style={styles.signSubmitText}>동의 및 서명하기</Text>
          </TouchableOpacity>

          <Text style={styles.signFooter}>보호자: 김OO  •  환자: 이OO</Text>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqSectionTitle}>자주 묻는 질문 (FAQ)</Text>
          {FAQ_ITEMS.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.faqRow}
              activeOpacity={0.75}
              onPress={() => Alert.alert("FAQ", q)}
            >
              <Text style={styles.faqRowText}>{q}</Text>
              <Ionicons name="chevron-forward" size={20} color={SLATE_500} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  headerBack: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: BLUE,
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 36,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: SLATE_600,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardIconRow: {
    marginBottom: 10,
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    color: SLATE_700,
    marginBottom: 12,
  },
  linkInline: {
    color: BLUE,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  infoBoxAccent: {
    backgroundColor: "#F1F5F9",
    borderLeftWidth: 4,
    borderLeftColor: BLUE,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  infoBoxText: {
    fontSize: 13,
    lineHeight: 20,
    color: SLATE_600,
  },
  q1Btn: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  q1BtnDone: {
    backgroundColor: "#CBD5E1",
  },
  q1BtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: SLATE_700,
  },
  q1BtnTextDone: {
    color: "#0F172A",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: SLATE_700,
  },
  signCard: {
    backgroundColor: BLUE,
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: BLUE,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  signHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  shieldIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  signHeaderText: {
    flex: 1,
  },
  signTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  signDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.92)",
  },
  signPad: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  signPadText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
  },
  signSubmit: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  signSubmitText: {
    fontSize: 16,
    fontWeight: "900",
    color: BLUE,
  },
  signFooter: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(191,219,254,0.95)",
    textAlign: "center",
  },
  faqSection: {
    backgroundColor: "#EEF2F6",
    borderRadius: 16,
    padding: 14,
    paddingBottom: 6,
  },
  faqSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 12,
    marginLeft: 4,
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  faqRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: SLATE_700,
    paddingRight: 8,
  },
});
