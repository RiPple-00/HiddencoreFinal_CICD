import React, { useMemo } from "react";
import { TextInput, View } from "react-native";
import Text from "../Text";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

/**
 * 식사(Meal) 섹션 - 가로 3열(아침/점심/저녁) x 세로 3행(식사 섭취량/수분 섭취량/사례 여부) 그리드.
 * abnormal시 memo 입력 가능
 */
const SLOTS = [
  { key: "morning", label: "아침" },
  { key: "lunch",   label: "점심" },
  { key: "dinner",  label: "저녁" },
];

const ROWS = [
  { key: "intake",    label: "식사 섭취량" },
  { key: "hydration", label: "수분 섭취량" },
  { key: "incident",  label: "사례 여부" },
];

export default function CaregiverMealCheckTable({ value, onChange }) {
  const safeValue = value || {};

  const updateCell = (slotKey, rowKey, partial) => {
    const slot = safeValue[slotKey] || {};
    const cell = slot[rowKey] || {};
    onChange({
      ...safeValue,
      [slotKey]: { ...slot, [rowKey]: { ...cell, ...partial } },
    });
  };

  // 9칸 중 이상으로 표시된 셀만 모아 메모 입력을 노출.
  const abnormalCells = useMemo(() => {
    const list = [];
    SLOTS.forEach((slot) => {
      ROWS.forEach((row) => {
        const cell = safeValue?.[slot.key]?.[row.key];
        if (cell?.status === "abnormal") {
          list.push({
            slotKey:   slot.key,
            slotLabel: slot.label,
            rowKey:    row.key,
            rowLabel:  row.label,
            memo:      cell.memo ?? "",
          });
        }
      });
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue]);

  return (
    <View className="px-2 py-[6px]">
      {/* 헤더 행 (아침/점심/저녁) */}
      <View className="flex-row items-center py-[6px] border-b border-caregiver-bg-secondary">
        <View style={{ width: 78 }} className="px-1" />
        {SLOTS.map((slot) => (
          <View key={slot.key} className="flex-1 items-center">
            <Text className="text-[13px] font-bold text-caregiver-text-primary">{slot.label}</Text>
          </View>
        ))}
      </View>

      {/* 데이터 행 */}
      {ROWS.map((row, idx) => (
        <View
          key={row.key}
          className={`flex-row items-center py-[6px] ${idx < ROWS.length - 1 ? "border-b border-caregiver-bg-secondary" : ""}`}
        >
          <View style={{ width: 78 }} className="px-1">
            <Text className="text-[13px] font-bold text-caregiver-text-primary">{row.label}</Text>
          </View>
          {SLOTS.map((slot) => (
            <View key={slot.key} className="flex-1 items-center justify-center">
              <CaregiverStatusToggle
                size="sm"
                value={safeValue[slot.key]?.[row.key]?.status ?? null}
                onChange={(next) =>
                  updateCell(slot.key, row.key, {
                    status: next,
                    // 정상 / 미선택으로 돌리면 해당 셀 메모도 함께 비운다.
                    ...(next !== "abnormal" ? { memo: "" } : {}),
                  })
                }
              />
            </View>
          ))}
        </View>
      ))}

      {/* 이상으로 표시된 셀별 메모 입력 */}
      {abnormalCells.length > 0 && (
        <View className="mt-1 px-1 pt-2 border-t border-caregiver-bg-secondary">
          <Text className="text-xs text-caregiver-text-secondary mb-[6px]">이상 항목 메모</Text>
          {abnormalCells.map((cell) => (
            <View key={`${cell.slotKey}-${cell.rowKey}`} className="mb-2">
              <View className="flex-row mb-1">
                <View className="bg-error-secondary border border-error-primary rounded-full px-2 py-[2px]">
                  <Text className="text-[11px] font-bold text-error-primary">
                    {cell.slotLabel} · {cell.rowLabel}
                  </Text>
                </View>
              </View>
              <TextInput
                value={cell.memo}
                onChangeText={(text) => updateCell(cell.slotKey, cell.rowKey, { memo: text })}
                placeholder={`${cell.slotLabel} ${cell.rowLabel} 이상 사유를 입력하세요`}
                placeholderTextColor="#949BA0"
                className="border border-error-primary bg-caregiver-bg-primary rounded-lg px-[10px] py-2 text-[13px] text-caregiver-text-primary"
                style={{ minHeight: 40 }}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}