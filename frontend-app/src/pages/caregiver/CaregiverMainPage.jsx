import React, { useState } from "react";
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { styles } from "../../styles/caregiverMain.styles";

export default function CaregiverMainPage({ navigation }) {
  const mockPatients = [
    "김태진 (68세) / 502호",
    "이성우 (88세) / 305호",
    "박미정 (74세) / 411호",
  ];
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.iconText}>🏥</Text>
              <Text style={styles.logoText}>따숨</Text>
            </View>
            <View style={styles.headerIcons}>
              <Text style={styles.iconText}>🔔</Text>
              <Text style={styles.iconText}>☰</Text>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.patientSelect}
              onPress={() => setPickerOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.patientSelectText}>{selectedPatient} ▾</Text>
            </TouchableOpacity>

            {pickerOpen && (
              <View style={styles.patientPickerList}>
                {mockPatients.map((patient) => (
                  <TouchableOpacity
                    key={patient}
                    style={styles.patientPickerItem}
                    onPress={() => {
                      setSelectedPatient(patient);
                      setPickerOpen(false);
                    }}
                  >
                    <Text style={styles.patientPickerItemText}>{patient}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>2주 일정 요약</Text>
              <View style={styles.dayRow}>
                {["12", "13", "14", "15", "16", "17", "18"].map((d) => (
                  <View key={d} style={[styles.dayCell, d === "14" && styles.dayCellActive]}>
                    <Text style={styles.dayText}>{d}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.dayRow}>
                {["19", "20", "21", "22", "23", "24", "25"].map((d) => (
                  <View key={d} style={styles.dayCell}>
                    <Text style={styles.dayText}>{d}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.legendItem}>● 03/11 09:00 오전 근무</Text>
              <Text style={styles.legendItem}>● 03/14 15:00 휴무</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘 중요 일정</Text>
            <View style={styles.importantCard}>
              <Text style={styles.importantTitle}>김태진 (68세)</Text>
              <Text style={styles.importantDesc}>수술입력 및 복약 준비 및 금식</Text>
            </View>
            <View style={styles.importantCard}>
              <Text style={styles.importantTitle}>이성우 (88세)</Text>
              <Text style={styles.importantDesc}>체계기록 면회</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.quickWrap}>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate("CaregiverWorkCheck")}>
                <Text style={styles.iconText}>📋</Text>
                <Text style={styles.quickLabel}>업무 체크</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate("CaregiverPatientList")}>
                <Text style={styles.iconText}>📂</Text>
                <Text style={styles.quickLabel}>환자 목록</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard}>
                <Text style={styles.iconText}>🗓️</Text>
                <Text style={styles.quickLabel}>사진 업로드</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>오늘의 식단</Text>
              <Text style={styles.importantDesc}>메인 메뉴: 전복죽</Text>
              <Text style={styles.importantDesc}>계란찜, 시금치 나물, 백김치</Text>
              <Text style={styles.importantDesc}>후식용 계절 과일</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.noticeTitle}>공지사항</Text>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeMain}>춘계 보호자 간담회 안내</Text>
              <Text style={styles.noticeDate}>2024.03.28</Text>
            </View>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeMain}>면회 예약 시스템 점검 안내</Text>
              <Text style={styles.noticeDate}>2024.03.25</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>🏠</Text>
            <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>홈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>📷</Text>
            <Text style={styles.bottomLabel}>QR 체크</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>🚨</Text>
            <Text style={styles.bottomLabel}>긴급 호출</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
