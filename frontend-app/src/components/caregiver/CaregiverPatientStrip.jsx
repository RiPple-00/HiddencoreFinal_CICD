import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * "김따숨 (M/82)" + "441212 · Ward 402 · 72283944" 형태의 환자 정보 스트립.
 *
 * props:
 *   name      : "김따숨"
 *   genderAge : "M/82"   (선택)
 *   metaItems : ["441212", "Ward 402", "72283944"]
 *   onPressIdCard : 우측 ID 아이콘 클릭 핸들러(선택)
 */
export default function CaregiverPatientStrip({
  name,
  genderAge,
  metaItems = [],
  onPressIdCard,
}) {
  const compositeName = genderAge ? `${name} (${genderAge})` : name;
  const meta = metaItems.filter(Boolean).join(" · ");

  return (
    <View style={styles.strip}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{compositeName}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <Text onPress={onPressIdCard} style={styles.iconText}>
        🪪
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: "#F5F7FB",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E1E6EF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F3552",
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: "#7A8BA2",
  },
  iconText: {
    fontSize: 22,
    color: "#1F3552",
  },
});
