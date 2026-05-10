import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import CaregiverStatusToggle from "./CaregiverStatusToggle";

/**
 * 식사(Meal) 섹션 - 가로 3열(아침/점심/저녁) x 세로 3행(식사 섭취량/수분 섭취량/사례 여부) 그리드.
 *
 * 각 셀은 { status: null|"normal"|"abnormal", memo: string } 형태이며,
 * 어떤 셀이라도 status="abnormal" 이면 그리드 아래에 그 셀 전용 메모 입력란이 펼쳐진다.
 *
 * value = {
 *   morning: {
 *     intake:   { status, memo },
 *     hydration:{ status, memo },
 *     incident: { status, memo },
 *   },
 *   lunch: { ... },
 *   dinner: { ... },
 * }
 */
const SLOTS = [
  { key: "morning", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
];

const ROWS = [
  { key: "intake", label: "식사 섭취량" },
  { key: "hydration", label: "수분 섭취량" },
  { key: "incident", label: "사례 여부" },
];

export default function CaregiverMealCheckTable({ value, onChange }) {
  const safeValue = value || {};

  const updateCell = (slotKey, rowKey, partial) => {
    const slot = safeValue[slotKey] || {};
    const cell = slot[rowKey] || {};
    onChange({
      ...safeValue,
      [slotKey]: {
        ...slot,
        [rowKey]: { ...cell, ...partial },
      },
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
            slotKey: slot.key,
            slotLabel: slot.label,
            rowKey: row.key,
            rowLabel: row.label,
            memo: cell.memo ?? "",
          });
        }
      });
    });
    return list;
    // 의존성: value 가 바뀌면 다시 계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue]);

  return (
    <View style={styles.wrap}>
      {/* 헤더 행 (아침/점심/저녁) */}
      <View style={styles.row}>
        <View style={styles.labelCell} />
        {SLOTS.map((slot) => (
          <View key={slot.key} style={styles.headerCell}>
            <Text style={styles.headerText}>{slot.label}</Text>
          </View>
        ))}
      </View>

      {/* 데이터 행 */}
      {ROWS.map((row, idx) => (
        <View
          key={row.key}
          style={[styles.row, idx === ROWS.length - 1 && styles.rowLast]}
        >
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>{row.label}</Text>
          </View>
          {SLOTS.map((slot) => (
            <View key={slot.key} style={styles.toggleCell}>
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
      {abnormalCells.length > 0 ? (
        <View style={styles.memoListBlock}>
          <Text style={styles.memoLabel}>이상 항목 메모</Text>
          {abnormalCells.map((cell) => (
            <View
              key={`${cell.slotKey}-${cell.rowKey}`}
              style={styles.memoItem}
            >
              <View style={styles.memoBadgeRow}>
                <View style={styles.memoBadge}>
                  <Text style={styles.memoBadgeText}>
                    {cell.slotLabel} · {cell.rowLabel}
                  </Text>
                </View>
              </View>
              <TextInput
                value={cell.memo}
                onChangeText={(text) =>
                  updateCell(cell.slotKey, cell.rowKey, { memo: text })
                }
                placeholder={`${cell.slotLabel} ${cell.rowLabel} 이상 사유를 입력하세요`}
                placeholderTextColor="#B0B9C8"
                style={styles.memoInput}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F8",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  labelCell: {
    width: 78,
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B3F5C",
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B3F5C",
  },
  toggleCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  memoListBlock: {
    marginTop: 4,
    paddingHorizontal: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F4F9",
  },
  memoLabel: {
    fontSize: 12,
    color: "#7A8BA2",
    marginBottom: 6,
  },
  memoItem: {
    marginBottom: 8,
  },
  memoBadgeRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  memoBadge: {
    backgroundColor: "#FCEAEC",
    borderColor: "#F0C5CB",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  memoBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C13E48",
  },
  memoInput: {
    borderWidth: 1,
    borderColor: "#F0C5CB",
    backgroundColor: "#FFF8F9",
    borderRadius: 8,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: "#1B2A3A",
  },
});
