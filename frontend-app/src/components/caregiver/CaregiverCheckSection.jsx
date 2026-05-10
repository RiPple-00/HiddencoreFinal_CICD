import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CaregiverCheckSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 8,
    color: "#1F3552",
    fontSize: 25,
    fontWeight: "800",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D9E0EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
});
