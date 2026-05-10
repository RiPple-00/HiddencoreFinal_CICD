import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { fetchCaregiverPatients } from "../../api/careChecklistApi";
import { styles } from "../../styles/caregiverMain.styles";

export default function CaregiverMainPage({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchCaregiverPatients();
        if (!mounted) return;
        const list = res.data ?? [];
        setPatients(list);
        setSelectedPatientId((prev) => prev ?? (list[0]?.patientId ?? null));
      } catch (e) {
        Alert.alert(
          "환자 목록",
          e?.response?.data?.message ?? "환자를 불러오지 못했습니다. 요양사로 로그인했는지 확인해 주세요."
        );
      } finally {
        if (mounted) setLoadingPatients(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId);
  const selectedLine = selectedPatient
    ? `${selectedPatient.name} (${selectedPatient.age ?? "?"}세) / ${selectedPatient.room ?? "-"}호`
    : loadingPatients
      ? "불러오는 중…"
      : "등록된 환자 없음";

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
              onPress={() => !loadingPatients && patients.length > 0 && setPickerOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              {loadingPatients ? (
                <ActivityIndicator color="#0B4EA2" />
              ) : (
                <Text style={styles.patientSelectText}>{selectedLine} ▾</Text>
              )}
            </TouchableOpacity>

            {pickerOpen && patients.length > 0 ? (
              <View style={styles.patientPickerList}>
                {patients.map((patient) => (
                  <TouchableOpacity
                    key={patient.patientId}
                    style={styles.patientPickerItem}
                    onPress={() => {
                      setSelectedPatientId(patient.patientId);
                      setPickerOpen(false);
                    }}
                  >
                    <Text style={styles.patientPickerItemText}>
                      {patient.name} ({patient.age ?? "?"}세) / {patient.room ?? "-"}호
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
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
              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => {
                  if (selectedPatientId == null) {
                    Alert.alert("안내", "먼저 담당 환자를 선택해 주세요.");
                    return;
                  }
                  navigation.navigate("CaregiverWorkCheck", { patientId: selectedPatientId });
                }}
              >
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
