import React from "react";
import { SafeAreaView, View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../../styles/caregiverWorkCheck.styles";

function StateButtons({ danger = false }) {
  return (
    <View style={styles.stateWrap}>
      <View style={[styles.stateBtn, !danger && styles.stateBtnActive]}>
        <Text style={[styles.stateText, !danger && styles.stateTextActive]}>정상</Text>
      </View>
      <View style={[styles.stateBtn, danger && styles.stateBtnDanger]}>
        <Text style={[styles.stateText, danger && styles.stateTextDanger]}>이상</Text>
      </View>
    </View>
  );
}

function Row({ label, danger = false, warnText }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, danger && { color: "#B94753" }]}>{label}</Text>
        {warnText ? <Text style={styles.rowSubWarn}>{warnText}</Text> : null}
      </View>
      <StateButtons danger={danger} />
    </View>
  );
}

export default function CaregiverWorkCheckPage({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.iconText}>🏥</Text>
            <Text style={styles.logoText}>따숨</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <Text style={styles.iconText}>🔔</Text>
            <Text style={styles.iconText}>☰</Text>
          </View>
        </View>

        <View style={styles.patientStrip}>
          <View>
            <Text style={styles.patientName}>Kim TTa Woo (M/82)</Text>
            <Text style={styles.patientMeta}>591212 · Ward 702 · 72283944</Text>
          </View>
          <Text style={styles.iconText}>🪪</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍴 식사 (Meal)</Text>
            <View style={styles.card}>
              <Row label="식사 섭취량" />
              <Row label="수분 섭취량" danger />
              <Row label="식욕 변화" />
              <Row label="식사 중 사례 여부" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧼 위생점검 (Hygiene)</Text>
            <View style={styles.card}>
              <Row label="침구류 청결도" />
              <Row label="환자 용품 청결" />
              <Row label="목욕 여부" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ 상태 안정화 (Condition)</Text>
            <View style={styles.card}>
              <Row label="호흡 양상" danger warnText="체크 확인 필요" />
              <Row label="통증 유무" />
              <Row label="낙상 유무" danger />
              <TextInput style={styles.memoInput} placeholder="상세 사유를 입력해주세요 (발생 시각 및 증거 등)" placeholderTextColor="#9AA7B8" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👣 배뇨 및 배변</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>💧 배뇨 (Urination)</Text>
                <Text style={{ color: "#7A8BA2" }}>⌄</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>🚻 배변 (Defecation)</Text>
                <Text style={{ color: "#7A8BA2" }}>⌃</Text>
              </View>
              <Row label="횟수" />
              <Row label="상태" />
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>🏠</Text>
            <Text style={styles.bottomLabel}>홈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>📷</Text>
            <Text style={[styles.bottomLabel, { color: "#0B4EA2" }]}>QR 체크</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>🚨</Text>
            <Text style={[styles.bottomLabel, { color: "#CC5A66" }]}>긴급 호출</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
