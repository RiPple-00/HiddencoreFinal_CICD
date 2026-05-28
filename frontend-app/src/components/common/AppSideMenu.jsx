import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";

export default function AppSideMenu({
  visible,
  topInset = 0,
  title = "메뉴",
  onClose,
  items = [],
}) {
  if (!visible) return null;

  return (
    <View style={styles.menuLayer} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={1}
        style={[StyleSheet.absoluteFillObject, styles.menuBackdrop]}
        onPress={onClose}
      />
      <View
        className="absolute right-0 bottom-0 w-64 bg-background-neutral p-6 border-l border-guardian-button-secondary"
        style={{ top: 0, paddingTop: topInset + 12 }}
      >
        <Text className="text-lg font-extrabold text-guardian-text-primary mb-6">
          {title}
        </Text>
        {items.map(({ label, onPress }) => (
          <TouchableOpacity
            key={label}
            className="py-4 border-b border-guardian-button-secondary"
            onPress={onPress}
          >
            <Text className="font-bold text-guardian-text-primary">
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20000,
  },
  menuBackdrop: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
