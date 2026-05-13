import React from "react";
import { TextInput, View } from "react-native";
import Text from "../Text";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

/**
 * 상태 안정화(Condition) 섹션 안의 한 줄.
 * - 이상 표시 시 좌측에 빨간 세로줄 + 라벨이 붉어진다.
 * - 추가로 "최근 확인 필요" 같은 보조 경고 텍스트를 노출할 수 있다.
 * - 이상으로 선택한 항목은 그 줄 바로 아래에 자기 전용 메모 입력란이 펼쳐진다.
 *
 * value = { status: null|"normal"|"abnormal", memo: string }
 */
export default function CaregiverConditionRow({ label, value, onChange, warnText, isLast = false }) {
  const safeValue  = value || {};
  const isAbnormal = safeValue.status === "abnormal";

  const updateStatus = (next) => {
    // 이상에서 정상/미선택으로 돌아가면 항목 메모도 함께 비운다.
    if (next !== "abnormal") {
      onChange({ ...safeValue, status: next, memo: "" });
    } else {
      onChange({ ...safeValue, status: next });
    }
  };
  const updateMemo = (text) => onChange({ ...safeValue, memo: text });

  return (
    <View className={`px-[14px] py-3 ${!isLast ? "border-b border-caregiver-bg-secondary" : ""}`}>
      {/* 이상 시 좌측 빨간 세로줄 - position absolute는 inline style 유지 */}
      {isAbnormal && (
        <View style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, backgroundColor: "#ED584C" }} />
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-[10px]">
          <Text className={`text-sm font-bold ${isAbnormal ? "text-error-primary" : "text-caregiver-text-primary"}`}>
            {label}
          </Text>
          {warnText && (
            <Text className="mt-[3px] text-[11px] font-bold text-error-primary">{warnText}</Text>
          )}
        </View>
        <CaregiverStatusToggle value={safeValue.status} onChange={updateStatus} />
      </View>

      {isAbnormal && (
        <TextInput
          value={safeValue.memo ?? ""}
          onChangeText={updateMemo}
          placeholder={`${label} 이상 사유를 간단히 입력하세요`}
          placeholderTextColor="#949BA0"
          className="mt-2 border border-error-primary bg-caregiver-bg-primary rounded-lg px-[10px] py-2 text-[13px] text-caregiver-text-primary"
          style={{ minHeight: 44 }}
          multiline
          textAlignVertical="top"
        />
      )}
    </View>
  );
}