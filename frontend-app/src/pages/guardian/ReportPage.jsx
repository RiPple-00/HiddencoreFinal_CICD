import { View, Text, StyleSheet } from "react-native";

export default function ReportPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>보고서 확인 페이지</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B4EA2",
  },
});