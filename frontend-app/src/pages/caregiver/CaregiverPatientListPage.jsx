import React, { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { styles } from "../../styles/caregiverPatientList.styles";

const patients = [
  { name: "김영희", age: 82, initial: "김", status: "혈압 안정 / 투약 완료", danger: false, mealType: "일반식" },
  { name: "이철수", age: 78, initial: "이", status: "미열 발생 / 관찰 요망", danger: true, mealType: "저염식" },
  { name: "박정숙", age: 85, initial: "박", status: "취침 중 / 상태 양호", danger: false, mealType: "연식" },
  { name: "최민호", age: 74, initial: "최", status: "재활 훈련 중", danger: false, mealType: "당뇨식" },
];

export default function CaregiverPatientListPage() {
  const navigation = useNavigation();
  const [selectedPatientName, setSelectedPatientName] = useState("김영희");

  const selectedPatient = useMemo(
    () => patients.find((p) => p.name === selectedPatientName) ?? patients[0],
    [selectedPatientName]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.searchWrap}>
              <Text style={styles.iconText}>🔎</Text>
              <Text style={styles.searchText}>환자 성함 또는 병실 호수 검색</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.floorLabel}>CURRENT FLOOR: 4F</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.roomTitle}>402호실</Text>
              <Text style={styles.occupancyChip}>👥 4/4명</Text>
            </View>
          </View>

          <View style={[styles.section, { marginTop: 8 }]}>
            <View style={styles.patientGrid}>
              {patients.map((p) => (
                <TouchableOpacity
                  key={p.name}
                  activeOpacity={0.85}
                  style={[
                    styles.patientCard,
                    selectedPatientName === p.name && styles.patientCardSelected,
                  ]}
                  onPress={() => setSelectedPatientName(p.name)}
                >
                  <View style={[styles.avatarCircle, { borderColor: p.danger ? "#B91C1C" : "#146C43" }]}>
                    <View style={[styles.avatarInner, { backgroundColor: p.danger ? "#FCE8EA" : "#CBEFDE" }]}>
                      <Text style={[styles.avatarText, { color: p.danger ? "#B91C1C" : "#146C43" }]}>{p.initial}</Text>
                    </View>
                  </View>
                  <Text style={styles.patientName}>
                    {p.name} · {p.age}세
                  </Text>
                  <Text style={[styles.patientStatus, p.danger && styles.dangerText]}>{p.status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{selectedPatient.mealType}</Text>
                <View style={styles.tabs}>
                  <View style={styles.tab}>
                    <Text style={styles.tabText}>아침</Text>
                  </View>
                  <View style={[styles.tab, styles.tabActive]}>
                    <Text style={[styles.tabText, styles.tabTextActive]}>점심</Text>
                  </View>
                  <View style={styles.tab}>
                    <Text style={styles.tabText}>저녁</Text>
                  </View>
                </View>
              </View>

              <View style={styles.mealBody}>
                <View style={styles.mealThumb}>
                  <Text>🍱</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealMain}>메인 메뉴: 전복죽</Text>
                  <Text style={styles.mealSub}>계란찜, 시금치 나물, 백김치</Text>
                  <Text style={styles.mealSub}>후식용 계절 과일</Text>
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneText}>식사 완료 (12:30)</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>🏠</Text>
            <Text style={[styles.bottomLabel, { color: "#4E81E0" }]}>홈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>📷</Text>
            <Text style={styles.bottomLabel}>QR 체크</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>📞</Text>
            <Text style={[styles.bottomLabel, { color: "#CC5A66" }]}>긴급 호출</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
