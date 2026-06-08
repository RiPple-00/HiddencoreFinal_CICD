import React, { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Text from "../Text";

/**
 * 배뇨 / 배변 한 줄.
 * - theme: "caregiver" (기본, 초록) | "guardian" (노랑)
 */
export default function CaregiverEliminationCard({ icon, label, value, onChange, isLast = false, readOnly = false, theme = "caregiver" }) {
  const safeValue = value || {};
  const logs = Array.isArray(safeValue.logs) ? safeValue.logs : [];

  const [expanded,         setExpanded]         = useState(false);
  const [abnormalFormOpen, setAbnormalFormOpen] = useState(false);
  const [pendingMemo,      setPendingMemo]      = useState("");

  const count = useMemo(() => logs.length, [logs]);

  const textPrimary     = theme === "guardian" ? "text-guardian-text-primary"     : "text-caregiver-text-primary";
  const textSecondary   = theme === "guardian" ? "text-guardian-text-secondary"   : "text-caregiver-text-secondary";
  const bgSecondary     = theme === "guardian" ? "bg-guardian-bg-secondary"       : "bg-caregiver-bg-secondary";
  const borderDivider   = theme === "guardian" ? "border-guardian-bg-secondary"   : "border-caregiver-bg-secondary";
  const borderSecondary = theme === "guardian" ? "border-guardian-button-secondary" : "border-caregiver-button-secondary";

  if (readOnly && theme === "guardian") {
    const hasAbnormal = logs.some((l) => l.status === "abnormal");
    const abnormalLogs = logs.filter((l) => l.status === "abnormal");

    return (
      <View className={`px-[14px] py-3 ${!isLast ? `border-b ${borderDivider}` : ""}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-[6px] flex-1">
            {icon && <Text className="text-base">{icon}</Text>}
            <Text className={`text-sm font-bold ${textPrimary}`}>{label}</Text>
          </View>
          {hasAbnormal ? (
            <View className="px-3 py-[3px] rounded-full bg-error-secondary border border-error-primary">
              <Text className="text-[11px] font-extrabold text-error-primary">이상 있음</Text>
            </View>
          ) : (
            <View className="px-3 py-[3px] rounded-full bg-success-secondary border border-success-primary">
              <Text className="text-[11px] font-extrabold text-success-primary">정상</Text>
            </View>
          )}
        </View>

        {hasAbnormal && (
          <View className="mt-[10px] p-[10px] rounded-[10px] bg-error-secondary border border-error-primary">
            <Text className="text-xs font-bold text-error-primary mb-[6px]">이상 사유</Text>
            {abnormalLogs.map((log, i) => (
              <View
                key={log.id}
                className={i > 0 ? "pt-2 mt-2 border-t border-error-primary border-opacity-30" : ""}
              >
                <Text className="text-xs text-error-primary leading-[18px]" numberOfLines={5}>
                  {log.memo ? log.memo : "사유 미입력"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  if (readOnly) {
    return (
      <View className={`px-[14px] py-3 ${!isLast ? `border-b ${borderDivider}` : ""}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-[6px] flex-1">
            {icon && <Text className="text-base">{icon}</Text>}
            <Text className={`text-sm font-bold ${textPrimary}`}>{label}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className={`text-xs ${textSecondary} font-bold`}>횟수</Text>
            <View className={`px-[10px] py-1 rounded-lg ${bgSecondary} border ${borderSecondary} items-center`} style={{ minWidth: 36 }}>
              <Text className={`text-sm font-extrabold ${textPrimary}`}>{count}</Text>
            </View>
          </View>
        </View>
        <View className={`mt-[10px] p-[10px] rounded-[10px] ${bgSecondary} border ${borderSecondary}`}>
          <Text className={`text-xs font-bold ${textPrimary} mb-[6px]`}>
            입력 로그 ({logs.length})
          </Text>
          {logs.length === 0 ? (
            <Text className={`text-xs ${textSecondary}`}>아직 입력된 로그가 없습니다.</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} className={`flex-row items-start py-2 border-t ${borderDivider}`}>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <View className={`px-2 py-[2px] rounded-full border ${
                      log.status === "abnormal"
                        ? "bg-error-secondary border-error-primary"
                        : "bg-success-secondary border-success-primary"
                    }`}>
                      <Text className={`text-[11px] font-extrabold ${
                        log.status === "abnormal" ? "text-error-primary" : "text-success-primary"
                      }`}>
                        {log.status === "abnormal" ? "이상" : "정상"}
                      </Text>
                    </View>
                    <Text className={`text-[11px] ${textSecondary}`}>
                      {formatTime(log.createdAt)}
                    </Text>
                  </View>
                  {log.memo ? (
                    <Text className={`mt-1 text-xs ${textPrimary} leading-4`} numberOfLines={5}>
                      {log.memo}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  }

  const writeLogs = (nextLogs) => {
    onChange({ ...safeValue, logs: nextLogs, count: nextLogs.length });
  };

  const addLog = (status, memo) => {
    writeLogs([{ id: makeId(), status, memo: memo ?? "", createdAt: new Date().toISOString() }, ...logs]);
  };

  const removeLog = (logId) => writeLogs(logs.filter((l) => l.id !== logId));

  const handlePressNormal = () => {
    setAbnormalFormOpen(false);
    setPendingMemo("");
    addLog("normal", "");
  };

  const handlePressAbnormal = () => {
    if (abnormalFormOpen) {
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
    <View className={`px-[14px] py-3 ${!isLast ? "border-b border-caregiver-bg-secondary" : ""}`}>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-[6px] flex-1">
          {icon && <Text className="text-base">{icon}</Text>}
          <Text className="text-sm font-bold text-caregiver-text-primary">{label}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-caregiver-text-secondary font-bold">횟수</Text>
          <View className="px-[10px] py-1 rounded-lg bg-caregiver-bg-secondary border border-caregiver-button-secondary items-center" style={{ minWidth: 36 }}>
            <Text className="text-sm font-extrabold text-caregiver-text-primary">{count}</Text>
          </View>
          <Pressable onPress={() => setExpanded((p) => !p)} hitSlop={6} className="px-1">
            <Text className="text-xs text-caregiver-text-secondary">{expanded ? "▲" : "▼"}</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-[10px] flex-row items-center justify-between pr-1">
        <Text className="text-xs text-caregiver-text-secondary font-bold">기록</Text>
        <View className="flex-row gap-[6px]">
          <Pressable
            onPress={handlePressNormal}
            className="min-w-[56px] rounded-lg py-[6px] px-[14px] items-center bg-background-neutral border border-caregiver-button-primary"
            style={{ borderWidth: 1.2 }}
            hitSlop={6}
          >
            <Text className="text-[13px] font-bold text-caregiver-text-primary">정상</Text>
          </Pressable>
          <Pressable
            onPress={handlePressAbnormal}
            className={`min-w-[56px] rounded-lg py-[6px] px-[14px] items-center ${
              abnormalFormOpen
                ? "bg-error-primary border-error-primary"
                : "bg-background-neutral border-caregiver-button-secondary"
            }`}
            style={{ borderWidth: 1.2 }}
            hitSlop={6}
          >
            <Text className={`text-[13px] font-bold ${abnormalFormOpen ? "text-white" : "text-caregiver-text-secondary"}`}>
              이상
            </Text>
          </Pressable>
        </View>
      </View>

      {abnormalFormOpen && (
        <View className="mt-[10px] p-[10px] rounded-[10px] bg-error-secondary border border-error-primary">
          <TextInput
            value={pendingMemo}
            onChangeText={setPendingMemo}
            placeholder={`${label} 이상 사유를 입력하세요`}
            placeholderTextColor="#949BA0"
            className="border border-error-primary bg-background-neutral rounded-lg px-[10px] py-2 text-[13px] text-caregiver-text-primary"
            style={{ minHeight: 56 }}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <Pressable
            onPress={handleSubmitAbnormal}
            className="mt-2 bg-error-primary rounded-lg py-[10px] items-center"
            hitSlop={6}
          >
            <Text className="text-white text-[13px] font-extrabold">제출</Text>
          </Pressable>
        </View>
      )}

      {expanded && (
        <View className="mt-[10px] p-[10px] rounded-[10px] bg-caregiver-bg-secondary border border-caregiver-button-secondary">
          <Text className="text-xs font-bold text-caregiver-text-primary mb-[6px]">
            입력 로그 ({logs.length})
          </Text>
          {logs.length === 0 ? (
            <Text className="text-xs text-caregiver-text-secondary">아직 입력된 로그가 없습니다.</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} className="flex-row items-start py-2 border-t border-caregiver-bg-secondary">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <View className={`px-2 py-[2px] rounded-full border ${
                      log.status === "abnormal"
                        ? "bg-error-secondary border-error-primary"
                        : "bg-success-secondary border-success-primary"
                    }`}>
                      <Text className={`text-[11px] font-extrabold ${
                        log.status === "abnormal" ? "text-error-primary" : "text-success-primary"
                      }`}>
                        {log.status === "abnormal" ? "이상" : "정상"}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-caregiver-text-secondary">
                      {formatTime(log.createdAt)}
                    </Text>
                  </View>
                  {log.memo ? (
                    <Text className="mt-1 text-xs text-caregiver-text-primary leading-4" numberOfLines={3}>
                      {log.memo}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => removeLog(log.id)}
                  hitSlop={8}
                  className="ml-2 px-[10px] py-1 rounded-[6px] bg-background-neutral border border-caregiver-button-secondary"
                >
                  <Text className="text-[11px] font-bold text-error-primary">삭제</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      )}
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
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const dd   = String(d.getDate()).padStart(2, "0");
    const hh   = String(d.getHours()).padStart(2, "0");
    const mi   = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}
