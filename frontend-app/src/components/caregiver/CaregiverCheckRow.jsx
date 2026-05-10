import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

export default function CaregiverCheckRow({ label, value, onChange, reason, onChangeReason }) {
  const isAbnormal = value === "abnormal";

  return (
    <View style={styles.row}>
      <View style={styles.rowInner}>
        <Text style={[styles.label, isAbnormal && styles.labelAbnormal]}>{label}</Text>
        <CaregiverStatusToggle value={value} onChange={onChange} />
      </View>

      {isAbnormal ? (
        <TextInput
          value={reason}
          onChangeText={onChangeReason}
          placeholder="상세 사유를 입력하세요 (발생 시각 및 징후 등)"
          placeholderTextColor="#98A7B8"
          multiline
          textAlignVertical="top"
          style={styles.reasonInput}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F6",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  label: {
    flex: 1,
    color: "#2B3F5C",
    fontSize: 20,
    fontWeight: "700",
  },
  labelAbnormal: {
    color: "#CF4254",
  },
  reasonInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F0C5CB",
    backgroundColor: "#FFF9FA",
    borderRadius: 8,
    minHeight: 60,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1B2A3A",
  },
});
