import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DEFAULT_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

/**
 * availableTimes: string[] (기본 슬롯)
 * selectedTime, onTimeSelect(time: string)
 */
const VisitTimeSelector = ({
  availableTimes = DEFAULT_TIMES,
  selectedTime,
  onTimeSelect,
}) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>시간 선택</Text>
      {availableTimes.length === 0 ? (
        <Text style={styles.empty}>선택 가능한 시간이 없습니다.</Text>
      ) : (
        <View style={styles.grid}>
          {availableTimes.map((time) => {
            const selected = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.slot, selected && styles.slotSelected]}
                onPress={() => onTimeSelect?.(time)}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.slotText, selected && styles.slotTextSelected]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  empty: { fontSize: 14, color: "#6B7280" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
  },
  slot: {
    width: "30%",
    flexGrow: 1,
    minWidth: "28%",
    maxWidth: "32%",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  slotSelected: {
    backgroundColor: "#0B4EA2",
    borderColor: "#0B4EA2",
  },
  slotText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  slotTextSelected: {
    color: "#fff",
  },
});

export default VisitTimeSelector;
