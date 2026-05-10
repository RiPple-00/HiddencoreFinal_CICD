import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

/**
 * 배뇨 / 배변 한 줄.
 *
 * 새로운 동작 모델:
 *  - "정상" 버튼을 누르면 즉시 logs 에 정상 로그 1건이 추가되어 횟수가 +1 된다.
 *  - "이상" 버튼을 누르면 메모 입력 + 제출 버튼이 펼쳐진다.
 *      → 사용자가 메모를 입력하고 [제출] 을 눌러야 비로소 이상 로그 1건이 추가되며 횟수가 +1 된다.
 *      → 같은 항목에서 다시 [이상] 을 누르면 폼이 닫힌다(취소).
 *  - 각 로그는 자기 status(정상/이상)와 자기 memo 를 가지므로, 같은 항목 안에서도 로그마다 다른 메모가 가능하다.
 *  - 우측 ▼ 아이콘을 누르면 로그 리스트가 펼쳐지고, 잘못 입력한 로그는 [삭제] 로 즉시 제거할 수 있다.
 *
 * value = {
 *   count?: number,
 *   logs?: [{ id, status: "normal"|"abnormal", memo: string, createdAt }]
 * }
 */
export default function CaregiverEliminationCard({
  icon,
  label,
  value,
  onChange,
  isLast = false,
}) {
  const safeValue = value || {};
  const logs = Array.isArray(safeValue.logs) ? safeValue.logs : [];

  const [expanded, setExpanded] = useState(false);
  const [abnormalFormOpen, setAbnormalFormOpen] = useState(false);
  const [pendingMemo, setPendingMemo] = useState("");

  const count = useMemo(() => logs.length, [logs]);

  const writeLogs = (nextLogs) => {
    onChange({
      ...safeValue,
      logs: nextLogs,
      count: nextLogs.length,
    });
  };

  const addLog = (status, memo) => {
    const log = {
      id: makeId(),
      status,
      memo: memo ?? "",
      createdAt: new Date().toISOString(),
    };
    writeLogs([log, ...logs]);
  };

  const removeLog = (logId) => {
    writeLogs(logs.filter((l) => l.id !== logId));
  };

  const handlePressNormal = () => {
    // 이상 폼이 열려있다면 정상 입력으로 전환되며 폼은 닫는다.
    setAbnormalFormOpen(false);
    setPendingMemo("");
    addLog("normal", "");
  };

  const handlePressAbnormal = () => {
    if (abnormalFormOpen) {
      // 토글 동작: 다시 누르면 폼 닫고 메모 폐기 (취소)
      setAbnormalFormOpen(false);
      setPendingMemo("");
    } else {
      setAbnormalFormOpen(true);
    }
  };

  const handleSubmitAbnormal = () => {
    addLog("abnormal", pendingMemo);
    setAbnormalFormOpen(false);
    setPendingMemo("");
  };

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      {/* 메인 행: 라벨 + 횟수 + 펼치기 ▼ */}
      <View style={styles.mainLine}>
        <View style={styles.labelGroup}>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={styles.label}>{label}</Text>
        </View>

        <View style={styles.controls}>
          <Text style={styles.fieldLabel}>횟수</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
          <Pressable
            onPress={() => setExpanded((p) => !p)}
            hitSlop={6}
            style={styles.chevronBtn}
          >
            <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
          </Pressable>
        </View>
      </View>

      {/* 액션 버튼 행 - 정상은 즉시 기록, 이상은 폼 토글 */}
      <View style={styles.actionLine}>
        <Text style={styles.fieldLabel}>기록</Text>
        <View style={styles.actionWrap}>
          <Pressable
            onPress={handlePressNormal}
            style={[styles.actionBtn, styles.actionBtnNormal]}
            hitSlop={6}
          >
            <Text style={styles.actionBtnNormalText}>정상</Text>
          </Pressable>
          <Pressable
            onPress={handlePressAbnormal}
            style={[
              styles.actionBtn,
              abnormalFormOpen
                ? styles.actionBtnAbnormalActive
                : styles.actionBtnAbnormalIdle,
            ]}
            hitSlop={6}
          >
            <Text
              style={
                abnormalFormOpen
                  ? styles.actionBtnAbnormalActiveText
                  : styles.actionBtnAbnormalIdleText
              }
            >
              이상
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 이상 선택 시: 메모 입력 + 제출 버튼 */}
      {abnormalFormOpen ? (
        <View style={styles.abnormalForm}>
          <TextInput
            value={pendingMemo}
            onChangeText={setPendingMemo}
            placeholder={`${label} 이상 사유를 입력하세요`}
            placeholderTextColor="#B0B9C8"
            style={styles.memoInput}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <Pressable
            onPress={handleSubmitAbnormal}
            style={styles.submitBtn}
            hitSlop={6}
          >
            <Text style={styles.submitBtnText}>제출</Text>
          </Pressable>
        </View>
      ) : null}

      {/* 로그 리스트 - 각 로그가 자기 status/memo 를 가진다 */}
      {expanded ? (
        <View style={styles.logBox}>
          <Text style={styles.logTitle}>입력 로그 ({logs.length})</Text>
          {logs.length === 0 ? (
            <Text style={styles.logEmpty}>아직 입력된 로그가 없습니다.</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={{ flex: 1 }}>
                  <View style={styles.logHeader}>
                    <View
                      style={[
                        styles.logBadge,
                        log.status === "abnormal"
                          ? styles.logBadgeAbnormal
                          : styles.logBadgeNormal,
                      ]}
                    >
                      <Text
                        style={[
                          styles.logBadgeText,
                          log.status === "abnormal"
                            ? styles.logBadgeAbnormalText
                            : styles.logBadgeNormalText,
                        ]}
                      >
                        {log.status === "abnormal" ? "이상" : "정상"}
                      </Text>
                    </View>
                    <Text style={styles.logTime}>
                      {formatTime(log.createdAt)}
                    </Text>
                  </View>
                  {log.memo ? (
                    <Text style={styles.logMemo} numberOfLines={3}>
                      {log.memo}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => removeLog(log.id)}
                  hitSlop={8}
                  style={styles.logDelete}
                >
                  <Text style={styles.logDeleteText}>삭제</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F8",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  mainLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  icon: { fontSize: 16 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B3F5C",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#7A8BA2",
    fontWeight: "700",
  },
  countBadge: {
    minWidth: 36,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#EEF3FA",
    borderWidth: 1,
    borderColor: "#D8DFE9",
    alignItems: "center",
  },
  countText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F3552",
  },
  chevronBtn: {
    paddingHorizontal: 4,
  },
  chevron: {
    fontSize: 12,
    color: "#7A8BA2",
  },
  actionLine: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 4,
  },
  actionWrap: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    minWidth: 56,
    borderRadius: 8,
    borderWidth: 1.2,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnNormal: {
    backgroundColor: "#FFFFFF",
    borderColor: "#3D6FE0",
  },
  actionBtnNormalText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3D6FE0",
  },
  actionBtnAbnormalIdle: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D5DCE5",
  },
  actionBtnAbnormalIdleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A8597",
  },
  actionBtnAbnormalActive: {
    backgroundColor: "#E83042",
    borderColor: "#E83042",
  },
  actionBtnAbnormalActiveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  abnormalForm: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF8F9",
    borderWidth: 1,
    borderColor: "#F0C5CB",
  },
  memoInput: {
    borderWidth: 1,
    borderColor: "#F0C5CB",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    minHeight: 56,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: "#1B2A3A",
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: "#E83042",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  logBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E6EBF3",
  },
  logTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F3552",
    marginBottom: 6,
  },
  logEmpty: {
    fontSize: 12,
    color: "#94A2B5",
  },
  logItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#EAEFF6",
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  logBadgeNormal: {
    backgroundColor: "#EAF1FF",
    borderColor: "#C3D5F2",
  },
  logBadgeAbnormal: {
    backgroundColor: "#FCEAEC",
    borderColor: "#F0C5CB",
  },
  logBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  logBadgeNormalText: {
    color: "#1E3A66",
  },
  logBadgeAbnormalText: {
    color: "#C13E48",
  },
  logTime: {
    fontSize: 11,
    color: "#7A8BA2",
  },
  logMemo: {
    marginTop: 4,
    fontSize: 12,
    color: "#1B2A3A",
    lineHeight: 16,
  },
  logDelete: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8DFE9",
  },
  logDeleteText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C13E48",
  },
});
