import React from "react";
import { View } from "react-native";
import Text from "@/components/Text";

/** 보호자 약 QR 스캔 (추후 카메라·API 연동) */
export default function MedicationQrScanPage() {
  return (
    <View className="flex-1 items-center justify-center bg-guardian-bg-secondary px-6">
      <Text className="text-xl font-bold text-guardian-text-primary text-center">
        약 QR 스캔
      </Text>
      <Text className="mt-3 text-sm text-guardian-text-neutral text-center">
        QR 스캔 기능은 준비 중입니다.
      </Text>
    </View>
  );
}
