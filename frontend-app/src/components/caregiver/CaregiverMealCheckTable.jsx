import React, { useMemo } from "react";
import { TextInput, View } from "react-native";
import Text from "../Text";
import CaregiverStatusToggle from "./CaregiverStatusToggle";
import { useI18n } from "@/hooks/useI18n";

/**
 * 식사(Meal) 섹션 - 가로 3열(아침/점심/저녁) x 세로 3행(식사 섭취량/수분 섭취량/사례 여부) 그리드.
 * - theme: "caregiver" (기본, 초록) | "guardian" (노랑)
 */
export default function CaregiverMealCheckTable({ value, onChange, readOnly = false, statusErrorMap = null, theme = "caregiver" }) {
  const { t, language } = useI18n();

  const SLOTS = [
    { key: "morning", label: t('live.meal_morning') },
    { key: "lunch",   label: t('live.meal_lunch') },
    { key: "dinner",  label: t('live.meal_dinner') },
  ];

  const ROWS = [
    { key: "intake",    label: t('live.meal_intake') },
    { key: "hydration", label: t('live.meal_hydration') },
    { key: "incident",  label: t('live.meal_incident') },
  ];
  const safeValue = value || {};

  const textPrimary   = theme === "guardian" ? "text-guardian-text-primary"   : "text-caregiver-text-primary";
  const textSecondary = theme === "guardian" ? "text-guardian-text-secondary" : "text-caregiver-text-secondary";
  const bgPrimary     = theme === "guardian" ? "bg-guardian-bg-primary"       : "bg-caregiver-bg-primary";
  const borderDivider = theme === "guardian" ? "border-guardian-bg-secondary" : "border-caregiver-bg-secondary";

  const updateCell = (slotKey, rowKey, partial) => {
    if (readOnly) return;
    const slot = safeValue[slotKey] || {};
    const cell = slot[rowKey] || {};
    onChange({
      ...safeValue,
      [slotKey]: { ...slot, [rowKey]: { ...cell, ...partial } },
    });
  };

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
  }, [safeValue, language]);

  return (
    <View className="px-2 py-[6px]">
      {/* 헤더 행 */}
      <View className={`flex-row items-center py-[6px] border-b ${borderDivider}`}>
        <View style={{ width: 78 }} className="px-1" />
        {SLOTS.map((slot) => (
          <View key={slot.key} className="flex-1 items-center">
            <Text className={`text-[13px] font-bold ${textPrimary}`}>{slot.label}</Text>
          </View>
        ))}
      </View>

      {/* 데이터 행 */}
      {ROWS.map((row, idx) => (
        <View
          key={row.key}
          className={`flex-row items-center py-[6px] ${idx < ROWS.length - 1 ? `border-b ${borderDivider}` : ""}`}
        >
          <View style={{ width: 78 }} className="px-1">
            <Text className={`text-[13px] font-bold ${textPrimary}`}>{row.label}</Text>
          </View>
          {SLOTS.map((slot) => (
            <View key={slot.key} className="flex-1 items-center justify-center">
              <View className={statusErrorMap?.[`${slot.key}.${row.key}`] ? "rounded-xl border-2 border-error-primary p-[2px]" : ""}>
                <CaregiverStatusToggle
                  size="sm"
                  readOnly={readOnly}
                  theme={theme}
                  value={safeValue[slot.key]?.[row.key]?.status ?? null}
                  onChange={(next) =>
                    updateCell(slot.key, row.key, {
                      status: next,
                      ...(next !== "abnormal" ? { memo: "" } : {}),
                    })
                  }
                />
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* 이상으로 표시된 셀별 메모 */}
      {abnormalCells.length > 0 && (
        <View className={`mt-1 px-1 pt-2 border-t ${borderDivider}`}>
          <Text className={`text-xs ${textSecondary} mb-[6px]`}>{t('live.abnormal_memo_title')}</Text>
          {abnormalCells.map((cell) => (
            <View key={`${cell.slotKey}-${cell.rowKey}`} className="mb-2">
              <View className="flex-row mb-1">
                <View className="bg-error-secondary border border-error-primary rounded-full px-2 py-[2px]">
                  <Text className="text-[11px] font-bold text-error-primary">
                    {cell.slotLabel} · {cell.rowLabel}
                  </Text>
                </View>
              </View>
              {readOnly ? (
                <Text className={`border border-error-primary ${bgPrimary} rounded-lg px-[10px] py-2 text-[13px] ${textPrimary} min-h-[40px]`}>
                  {cell.memo?.trim() ? cell.memo : "—"}
                </Text>
              ) : (
                <TextInput
                  value={cell.memo}
                  onChangeText={(text) => updateCell(cell.slotKey, cell.rowKey, { memo: text })}
                  placeholder={`${cell.slotLabel} ${cell.rowLabel} ${t('live.abnormal_reason_placeholder')}`}
                  placeholderTextColor="#949BA0"
                  className={`border border-error-primary ${bgPrimary} rounded-lg px-[10px] py-2 text-[13px] ${textPrimary}`}
                  style={{ minHeight: 40 }}
                  multiline
                  textAlignVertical="top"
                />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
