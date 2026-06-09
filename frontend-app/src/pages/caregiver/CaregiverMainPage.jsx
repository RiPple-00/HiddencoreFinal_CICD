import React, { useEffect, useState } from "react";
import { Alert, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCaregiverPatients } from "../../api/careChecklistApi";
import { getTodaySchedules } from "../../api/scheduleApi";
import { getCaregiverNotices } from "../../api/noticeApi";
import { resolveFacilityId } from "../../utils/facilityId";
import { caregiverPatientToTaskCheckRouteParams } from "../../utils/careCheckState";
import { resolveGuardianPrimaryPatientId } from "../../utils/guardianPatientId";
import CaregiverPatientSelect from "@/components/caregiver/basic/CaregiverPatientSelect";
import CaregiverCalendar from "@/components/caregiver/basic/CaregiverCalendar";
import CaregiverTodaySchedule from "@/components/caregiver/basic/CaregiverTodaySchedule";
import CaregiverWorkButton from "@/components/caregiver/basic/CaregiverWorkButton";
import CaregiverMeal from "@/components/caregiver/basic/CaregiverMeal";
import CaregiverNotice from "@/components/caregiver/basic/CaregiverNotice";

/** API 응답이 페이지네이션 객체({ content:[] })이거나 배열 직접일 경우 모두 처리 */
function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}

export default function CaregiverMainPage({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [todaySchedules, setTodaySchedules] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const [notices, setNotices] = useState(null);
  const [loadingNotices, setLoadingNotices] = useState(true);

  // 환자 목록 fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchCaregiverPatients();
        if (!mounted) return;
        const list = res.data ?? [];
        setPatients(list);
        setSelectedPatientId(
          (prev) => prev ?? resolveGuardianPrimaryPatientId(list) ?? list[0]?.patientId ?? null
        );
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
    return () => { mounted = false; };
  }, []);

  // 오늘 일정 + 공지사항 fetch (병렬)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const facilityId = await resolveFacilityId();
        const [scheduleRes, noticeRes] = await Promise.allSettled([
          getTodaySchedules(facilityId),
          getCaregiverNotices(facilityId, 5),
        ]);

        if (!mounted) return;

        if (scheduleRes.status === "fulfilled") {
          setTodaySchedules(extractList(scheduleRes.value?.data));
        } else {
          setTodaySchedules([]);
        }

        if (noticeRes.status === "fulfilled") {
          setNotices(extractList(noticeRes.value?.data));
        } else {
          setNotices([]);
        }
      } catch {
        if (mounted) {
          setTodaySchedules([]);
          setNotices([]);
        }
      } finally {
        if (mounted) {
          setLoadingSchedules(false);
          setLoadingNotices(false);
        }
      }
    })();
    return () => { mounted = false; };
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
    const params = caregiverPatientToTaskCheckRouteParams(selectedPatient);
    if (!params) {
      Alert.alert("안내", "환자 정보를 확인할 수 없습니다.");
      return;
    }
    navigation.navigate("CaregiverTaskCheck", params);
  };

  // 달력용 일정: scheduledAt → date 로 변환
  const calendarSchedules = (todaySchedules ?? []).map((s) => ({
    id: s.scheduleId ?? s.id,
    date: s.scheduledAt ? new Date(s.scheduledAt) : new Date(),
    title: s.title,
  }));

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

          <CaregiverCalendar schedules={calendarSchedules.length > 0 ? calendarSchedules : undefined} />

          <CaregiverTodaySchedule
            items={todaySchedules}
            loading={loadingSchedules}
          />

          <CaregiverWorkButton
            onPressWorkCheck={goWorkCheck}
            onPressPatientList={() =>
              navigation.navigate("CaregiverPatientList")
            }
            onPressPhoto={() => navigation.navigate("CaregiverPhotoUpload")}
          />

          <CaregiverMeal />

          <CaregiverNotice
            notices={notices}
            loading={loadingNotices}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
