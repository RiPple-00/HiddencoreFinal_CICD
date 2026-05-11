import React, { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Text from "../Text";

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
export default function CaregiverEliminationCard({ icon, label, value, onChange, isLast = false }) {
  const safeValue = value || {};
  const logs = Array.isArray(safeValue.logs) ? safeValue.logs : [];

  const [expanded,        setExpanded]        = useState(false);
  const [abnormalFormOpen, setAbnormalFormOpen] = useState(false);
  const [pendingMemo,     setPendingMemo]     = useState("");

  const count = useMemo(() => logs.length, [logs]);

  const writeLogs = (nextLogs) => {
    onChange({ ...safeValue, logs: nextLogs, count: nextLogs.length });
  };

  const addLog = (status, memo) => {
    writeLogs([{ id: makeId(), status, memo: memo ?? "", createdAt: new Date().toISOString() }, ...logs]);
  };

  const removeLog = (logId) => writeLogs(logs.filter((l) => l.id !== logId));

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
    <View className={`px-[14px] py-3 ${!isLast ? "border-b border-caregiver-bg-secondary" : ""}`}>

      {/* 메인 행: 라벨 + 횟수 + 펼치기 ▼ */}
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

      {/* 액션 버튼 행 - 정상은 즉시 기록, 이상은 폼 토글 */}
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

      {/* 이상 선택 시: 메모 입력 + 제출 버튼 */}
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

      {/* 로그 리스트 - 각 로그가 자기 status/memo 를 가진다 */}
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