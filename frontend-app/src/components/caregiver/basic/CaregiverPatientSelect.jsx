import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Text from "../../Text";

/**
 * 담당 환자 선택(토글 드롭다운).
 */
export default function CaregiverPatientSelect({
  patients,
  loadingPatients,
  pickerOpen,
  onTogglePicker,
  onSelectPatient,
  selectedLine,
}) {
  return (
    <View className="mx-4 mt-4">
      <TouchableOpacity
        className="bg-caregiver-button-primary rounded-xl px-4 py-3"
        onPress={() =>
          !loadingPatients && patients.length > 0 && onTogglePicker()
        }
        activeOpacity={0.8}
      >
        {loadingPatients ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-center">
            {selectedLine} ▾
          </Text>
        )}
      </TouchableOpacity>

      {pickerOpen && patients.length > 0 ? (
        <View className="bg-background-neutral rounded-xl border border-caregiver-button-secondary mt-1">
          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.patientId}
              className="px-4 py-3 border-b border-caregiver-bg-secondary"
              onPress={() => onSelectPatient(patient.patientId)}
            >
              <Text className="text-caregiver-text-primary font-bold">
                {patient.name} ({patient.age ?? "?"}세) / {patient.room ?? "-"}호
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
