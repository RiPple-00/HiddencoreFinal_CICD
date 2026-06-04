import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/Text";

import { decodeJwtPayload, getAccessToken } from "@/api";
import bedRoomApi from "@/api/bedRoomApi";
import { fetchCaregiverPatients } from "@/api/careChecklistApi";
import { caregiverPatientToTaskCheckRouteParams } from "@/utils/careCheckState";
import {
  isCriticalStatus,
  mapBedFromApi,
  normalizeRoom,
  resolveCaregiverWard,
} from "@/utils/caregiverWard";

function patientById(patients, patientId) {
  if (patientId == null) return null;
  return patients.find((p) => Number(p.patientId) === Number(patientId)) ?? null;
}

export default function CaregiverPatientListPage({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [beds, setBeds] = useState([]);
  const [ward, setWard] = useState({ room: null, building: null, floor: null });
  const [myPatients, setMyPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [roomCapacity, setRoomCapacity] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const payload = decodeJwtPayload(token);
      const caregiverUserId = payload?.sub ? Number(payload.sub) : null;

      const { data: patientList } = await fetchCaregiverPatients();
      const list = patientList ?? [];
      const wardInfo = resolveCaregiverWard(list, caregiverUserId);

      if (!wardInfo.room) {
        setBeds([]);
        setMyPatients([]);
        setWard({ room: null, building: null, floor: null });
        setError("담당 병실이 없습니다. 원무과에서 107호 담당 배정을 확인해 주세요.");
        return;
      }

      setMyPatients(wardInfo.myPatients);
      setWard({
        room: wardInfo.room,
        building: wardInfo.building,
        floor: wardInfo.floor,
      });

      const bedRes = await bedRoomApi.getBedsByRoom(
        wardInfo.room,
        wardInfo.building ?? undefined,
        wardInfo.floor ?? undefined
      );
      const rawBeds = bedRes?.data ?? [];
      const mapped = rawBeds.map(mapBedFromApi);
      setBeds(mapped);
      setRoomCapacity(rawBeds[0]?.roomCapacity ?? mapped.length);

      const firstOccupied = mapped.find((b) => b.occupied && b.patientId);
      setSelectedPatientId((prev) => prev ?? firstOccupied?.patientId ?? null);
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ??
          "병상·환자 정보를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredBeds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return beds;
    return beds.filter((b) => {
      const name = (b.patientName ?? "").toLowerCase();
      const bed = (b.bedLabel ?? "").toLowerCase();
      return name.includes(q) || bed.includes(q);
    });
  }, [beds, search]);

  const occupiedCount = useMemo(
    () => beds.filter((b) => b.occupied).length,
    [beds]
  );

  const selectedPatient = useMemo(
    () => patientById(myPatients, selectedPatientId),
    [myPatients, selectedPatientId]
  );

  const selectedBed = useMemo(
    () => beds.find((b) => Number(b.patientId) === Number(selectedPatientId)),
    [beds, selectedPatientId]
  );

  const openTaskCheck = (patient) => {
    const params = caregiverPatientToTaskCheckRouteParams(patient);
    if (!params) {
      Alert.alert("안내", "환자 정보를 확인할 수 없습니다.");
      return;
    }
    navigation?.navigate?.("CaregiverTaskCheck", params);
  };

  const onPressBed = (bed) => {
    if (!bed.occupied || !bed.patientId) return;
    const patient = patientById(myPatients, bed.patientId);
    if (!patient) {
      Alert.alert("안내", "담당 환자가 아닙니다.");
      return;
    }
    setSelectedPatientId(bed.patientId);
  };

  const floorLabel =
    ward.floor != null && ward.floor !== ""
      ? `${ward.floor}F`
      : "-";

  return (
    <SafeAreaView
      className="flex-1 bg-caregiver-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#005E53" />
            <Text className="mt-3 text-caregiver-text-secondary">
              병상 배치 불러오는 중…
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="mx-4 mt-4">
              <View className="flex-row items-center gap-2 bg-background-neutral rounded-xl px-4 py-3 border border-caregiver-button-secondary">
                <Text className="text-xl">🔎</Text>
                <TextInput
                  className="flex-1 text-caregiver-text-primary text-base"
                  placeholder="환자 성함 또는 침상 검색"
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            </View>

            {error ? (
              <View className="mx-4 mt-6 p-4 rounded-xl bg-error-secondary border border-error-primary">
                <Text className="text-error-primary text-sm">{error}</Text>
              </View>
            ) : (
              <>
                <View className="mx-4 mt-4">
                  <Text className="text-xs font-bold text-caregiver-text-secondary mb-1">
                    CURRENT FLOOR: {floorLabel}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-extrabold text-caregiver-text-primary">
                      {ward.room}호실
                    </Text>
                    <View className="bg-caregiver-bg-secondary px-3 py-1 rounded-full">
                      <Text className="text-sm font-bold text-caregiver-text-primary">
                        👥 {occupiedCount}/{roomCapacity || beds.length}명
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-caregiver-text-secondary mt-1">
                    {ward.building ? `${ward.building} · ` : ""}
                    병상 배치 순서 (원무과와 동일)
                  </Text>
                </View>

                <View className="mx-4 mt-2 py-3 rounded-xl bg-caregiver-bg-secondary items-center">
                  <Text className="text-xs font-bold text-caregiver-text-secondary tracking-widest">
                    창문 (WINDOW)
                  </Text>
                </View>

                <View className="mx-4 mt-3 flex-row flex-wrap gap-3">
                  {filteredBeds.map((bed) => {
                    const isSelected =
                      bed.patientId != null &&
                      Number(bed.patientId) === Number(selectedPatientId);
                    const danger = isCriticalStatus(bed.status);
                    const empty = !bed.occupied;

                    if (empty) {
                      return (
                        <View
                          key={bed.locationId ?? bed.bedLabel}
                          className="w-[47%] min-h-[140px] bg-slate-50 rounded-2xl p-3 items-center justify-center border border-dashed border-caregiver-bg-secondary"
                        >
                          <Text className="text-2xl text-caregiver-text-neutral">+</Text>
                          <Text className="text-xs font-bold text-caregiver-text-secondary mt-1">
                            침상 {bed.bedLabel}
                          </Text>
                          <Text className="text-xs text-caregiver-text-neutral">
                            빈 병상
                          </Text>
                        </View>
                      );
                    }

                    const initial = (bed.patientName ?? "?").charAt(0);
                    const isMine = myPatients.some(
                      (p) => Number(p.patientId) === Number(bed.patientId)
                    );

                    return (
                      <TouchableOpacity
                        key={bed.locationId ?? bed.bedLabel}
                        activeOpacity={0.85}
                        className={`w-[47%] bg-background-neutral rounded-2xl p-3 items-center border ${
                          isSelected
                            ? "border-caregiver-button-primary bg-caregiver-bg-secondary"
                            : "border-caregiver-bg-secondary"
                        } ${!isMine ? "opacity-60" : ""}`}
                        onPress={() => onPressBed(bed)}
                        onLongPress={() => {
                          const p = patientById(myPatients, bed.patientId);
                          if (p) openTaskCheck(p);
                        }}
                      >
                        <Text className="text-[10px] font-bold text-caregiver-text-secondary self-start mb-1">
                          침상 {bed.bedLabel}
                        </Text>
                        <View
                          style={{ borderColor: danger ? "#ED584C" : "#005E53" }}
                          className="w-14 h-14 rounded-full border-2 justify-center items-center"
                        >
                          <View
                            style={{
                              backgroundColor: danger ? "#FEECEB" : "#E6F7ED",
                            }}
                            className="w-11 h-11 rounded-full justify-center items-center"
                          >
                            <Text
                              style={{ color: danger ? "#ED584C" : "#005E53" }}
                              className="text-base font-bold"
                            >
                              {initial}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm font-bold text-caregiver-text-primary mt-2 text-center">
                          {bed.patientName ?? "-"} · {bed.age ?? "?"}세
                        </Text>
                        <Text
                          className={`text-xs mt-1 text-center ${
                            danger
                              ? "text-error-primary"
                              : "text-caregiver-text-neutral"
                          }`}
                        >
                          {bed.status ?? "-"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View className="mx-4 mt-2 py-3 rounded-xl bg-caregiver-bg-secondary items-center">
                  <Text className="text-xs font-bold text-caregiver-text-secondary tracking-widest">
                    출입문 (DOOR)
                  </Text>
                </View>

                {selectedPatient && (
                  <View className="mx-4 mt-4">
                    <TouchableOpacity
                      className="bg-caregiver-button-primary rounded-xl py-3 items-center mb-3"
                      onPress={() => openTaskCheck(selectedPatient)}
                    >
                      <Text className="text-white font-bold">
                        {selectedPatient.name} 업무 체크 열기
                      </Text>
                    </TouchableOpacity>

                    <View className="bg-background-neutral rounded-2xl p-4">
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="font-bold text-caregiver-text-primary">
                          {selectedBed?.mealType ?? selectedPatient.dietType ?? "식단"}
                        </Text>
                        <Text className="text-xs text-caregiver-text-secondary">
                          침상 {selectedBed?.bedLabel ?? "-"}
                        </Text>
                      </View>
                      <Text className="text-sm text-caregiver-text-neutral">
                        식단·간호 기록은 업무 체크 화면에서 입력합니다.
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
