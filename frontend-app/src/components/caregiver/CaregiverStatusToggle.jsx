import React from "react";
import { Pressable, View } from "react-native";
import Text from "../Text";

/**
 * 정상 / 이상 두 개 버튼 한 쌍.
 * - value : null | "normal" | "abnormal"
 * - theme : "caregiver" | "guardian"
 *
 * 선택 상태 (두 테마 모두 soft-fill 스타일):
 *   정상 caregiver → 연초록(caregiver-bg-secondary) + 초록 보더 + 초록 텍스트
 *   정상 guardian  → 연노랑(guardian-button-secondary) + 노랑 보더 + 갈색 텍스트
 *   이상 공통      → 연분홍(error-secondary) + 붉은 보더 + 붉은 텍스트
 *
 * 미선택 상태:
 *   caregiver → 흰 배경 + 초록/회색 보더
 *   guardian  → 흰 배경 + gray-200 보더 + gray-400 텍스트
 *
 * 한쪽 선택 시 반대쪽 흐리게: guardian 전용
 */
export default function CaregiverStatusToggle({
  value,
  onChange,
  size = "md",
  readOnly = false,
  theme = "caregiver",
}) {
  const isNormal   = value === "normal";
  const isAbnormal = value === "abnormal";
  const hasValue   = value !== null;
  const isSm       = size === "sm";
  const Btn        = readOnly ? View : Pressable;

  const base    = isSm
    ? "min-w-[44px] rounded-[7px] py-1 px-2 items-center justify-center border"
    : "min-w-[56px] rounded-lg py-[6px] px-[14px] items-center justify-center border";
  const txtSize = isSm ? "text-xs font-bold" : "text-[13px] font-bold";

  // ── 정상 버튼 배경·보더 ──────────────────────────────────────
  const normalBg = isNormal
    ? theme === "guardian"
      ? "bg-guardian-button-secondary border-guardian-button-primary"  // 연노랑 + 노랑 보더
      : "bg-caregiver-button-primary border-caregiver-button-primary"  // solid 초록
    : theme === "guardian"
      ? "bg-background-neutral border-gray-200"
      : "bg-background-neutral border-caregiver-button-primary";

  const normalTxt = isNormal
    ? theme === "guardian"
      ? "text-guardian-text-primary"  // 갈색
      : "text-white"                  // 흰 글씨
    : theme === "guardian"
      ? "text-gray-400"
      : "text-caregiver-text-primary";

  // ── 이상 버튼 배경·보더 ──────────────────────────────────────
  // 두 테마 공통: 연분홍 배경 + 붉은 보더 + 붉은 텍스트
  const abnormalBg = isAbnormal
    ? "bg-error-secondary border-error-primary"
    : theme === "guardian"
      ? "bg-background-neutral border-gray-200"
      : "bg-background-neutral border-caregiver-button-secondary";

  const abnormalTxt = isAbnormal
    ? "text-error-primary"
    : theme === "guardian"
      ? "text-gray-400"
      : "text-caregiver-text-secondary";

  // guardian 전용: 선택된 쪽 외 반대 버튼 흐리게
  const normalOpacity   = theme === "guardian" && hasValue && !isNormal   ? 0.28 : 1;
  const abnormalOpacity = theme === "guardian" && hasValue && !isAbnormal ? 0.28 : 1;

  return (
    <View className={isSm ? "flex-row gap-1" : "flex-row gap-[6px]"}>
      {/* 정상 */}
      <Btn
        {...(readOnly ? {} : { onPress: () => onChange(isNormal ? null : "normal"), hitSlop: 6 })}
        className={`${base} ${normalBg}`}
        style={{ borderWidth: 1.2, opacity: normalOpacity }}
      >
        <Text className={`${txtSize} ${normalTxt}`}>정상</Text>
      </Btn>

      {/* 이상 */}
      <Btn
        {...(readOnly ? {} : { onPress: () => onChange(isAbnormal ? null : "abnormal"), hitSlop: 6 })}
        className={`${base} ${abnormalBg}`}
        style={{ borderWidth: 1.2, opacity: abnormalOpacity }}
      >
        <Text className={`${txtSize} ${abnormalTxt}`}>이상</Text>
      </Btn>
    </View>
  );
}
