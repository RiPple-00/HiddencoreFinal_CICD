import React, { useEffect, useState } from "react";
import { Alert, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCaregiverPatients } from "../../api/careChecklistApi";
import CaregiverPatientSelect from "@/components/caregiver/basic/CaregiverPatientSelect";
import CaregiverCalendar from "@/components/caregiver/basic/CaregiverCalendar";
import CaregiverTodaySchedule from "@/components/caregiver/basic/CaregiverTodaySchedule";
import CaregiverWorkButton from "@/components/caregiver/basic/CaregiverWorkButton";
import CaregiverMeal from "@/components/caregiver/basic/CaregiverMeal";
import CaregiverNotice from "@/components/caregiver/basic/CaregiverNotice";

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
          e?.response?.data?.message ??
            "환자를 불러오지 못했습니다. 요양사로 로그인했는지 확인해 주세요."
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

  const goWorkCheck = () => {
    if (selectedPatientId == null) {
      Alert.alert("안내", "먼저 담당 환자를 선택해 주세요.");
      return;
    }
    navigation.navigate("CaregiverWorkCheck", { patientId: selectedPatientId });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-caregiver-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <CaregiverPatientSelect
            patients={patients}
            loadingPatients={loadingPatients}
            pickerOpen={pickerOpen}
            onTogglePicker={() => setPickerOpen((prev) => !prev)}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setPickerOpen(false);
            }}
            selectedLine={selectedLine}
          />

          <CaregiverCalendar />

          <CaregiverTodaySchedule />

          <CaregiverWorkButton
            onPressWorkCheck={goWorkCheck}
            onPressPatientList={() =>
              navigation.navigate("CaregiverPatientList")
            }
            onPressPhoto={null}
          />

          <CaregiverMeal />

          <CaregiverNotice />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
