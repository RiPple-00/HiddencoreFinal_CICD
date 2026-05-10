// 요양사 앱에서 환자 상태를 체크하는 페이지

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import {
  fetchCaregiverLatestCareChecklist,
  fetchCaregiverPatients,
  saveCaregiverCareChecklist,
} from "../../api/careChecklistApi";
import { buildDefaultChecklist, mergeChecklistFromServer } from "../../utils/careChecklistModel";
import { styles } from "../../styles/caregiverWorkCheck.styles";

function StateButtons({ abnormal, onSelect }) {
  return (
    <View style={styles.stateWrap}>
      <TouchableOpacity
        style={[styles.stateBtn, { marginRight: 6 }, !abnormal && styles.stateBtnActive]}
        onPress={() => onSelect(false)}
      >
        <Text style={[styles.stateText, !abnormal && styles.stateTextActive]}>정상</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.stateBtn, abnormal && styles.stateBtnDanger]}
        onPress={() => onSelect(true)}
      >
        <Text style={[styles.stateText, abnormal && styles.stateTextDanger]}>이상</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, abnormal, warnText, onSelectAbnormal }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, abnormal && { color: "#B94753" }]}>{label}</Text>
        {warnText ? <Text style={styles.rowSubWarn}>{warnText}</Text> : null}
      </View>
      <StateButtons abnormal={abnormal} onSelect={onSelectAbnormal} />
    </View>
  );
}

export default function CaregiverWorkCheckPage({ navigation }) {
  const route = useRoute();
  const patientId = route.params?.patientId;

  const [patientLabel, setPatientLabel] = useState("");
  const [model, setModel] = useState(buildDefaultChecklist());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patientId == null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [patientsRes, latestRes] = await Promise.all([
          fetchCaregiverPatients(),
          fetchCaregiverLatestCareChecklist(patientId),
        ]);
        if (cancelled) return;
        const p = patientsRes.data?.find((x) => x.patientId === patientId);
        if (p) {
          const room = p.room ? `${p.room}호` : "병실 미정";
          setPatientLabel(`${p.name} (${p.age ?? "?"}세) / ${room}`);
        } else {
          setPatientLabel(`환자 #${patientId}`);
        }
        if (latestRes.status === 204) {
          setModel(buildDefaultChecklist());
        } else {
          setModel(mergeChecklistFromServer(buildDefaultChecklist(), latestRes.data.checklist));
        }
      } catch (e) {
        if (!cancelled) {
          console.warn(e);
          setModel(buildDefaultChecklist());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  function setRowAbnormal(sectionId, rowKey, abnormal) {
    setModel((m) => ({
      ...m,
      sections: m.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              rows: s.rows.map((r) => (r.key === rowKey ? { ...r, abnormal } : r)),
            }
      ),
    }));
  }

  async function onSave() {
    if (patientId == null) {
      Alert.alert("안내", "환자가 선택되지 않았습니다. 홈에서 환자를 선택한 뒤 다시 들어와 주세요.");
      return;
    }
    try {
      setSaving(true);
      await saveCaregiverCareChecklist(patientId, model);
      Alert.alert("저장 완료", "보호자 앱 실시간 화면에 반영됩니다.");
    } catch (e) {
      Alert.alert("저장 실패", e?.response?.data?.message ?? "네트워크 또는 권한을 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (patientId == null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { padding: 24 }]}>
          <Text style={styles.logoText}>환자 선택 필요</Text>
          <Text style={{ marginTop: 8, color: "#73839A" }}>홈 화면에서 담당 환자를 고른 뒤 업무 체크를 열어 주세요.</Text>
          <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
            <Text style={{ color: "#0B4EA2", fontWeight: "700" }}>‹ 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.iconText}>🏥</Text>
            <Text style={styles.logoText}>따숨</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            {saving ? <ActivityIndicator size="small" color="#0B4EA2" /> : null}
            <TouchableOpacity onPress={onSave} disabled={saving || loading}>
              <Text style={{ color: "#0B4EA2", fontWeight: "800" }}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.patientStrip}>
          <View style={{ flex: 1 }}>
            {loading ? <ActivityIndicator color="#0B4EA2" /> : <Text style={styles.patientName}>{patientLabel}</Text>}
            <Text style={styles.patientMeta}>요양 체크 후 저장하면 보호자에게 실시간 반영</Text>
          </View>
          <Text style={styles.iconText}>🪪</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {model.sections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.card}>
                {section.rows.map((r) => (
                  <Row
                    key={r.key}
                    label={r.label}
                    abnormal={r.abnormal}
                    warnText={r.key === "breathing" && r.abnormal ? "체크 확인 필요" : undefined}
                    onSelectAbnormal={(v) => setRowAbnormal(section.id, r.key, v)}
                  />
                ))}
                {section.id === "condition" ? (
                  <TextInput
                    style={styles.memoInput}
                    value={model.memo}
                    onChangeText={(memo) => setModel((m) => ({ ...m, memo }))}
                    placeholder="상세 사유를 입력해주세요 (발생 시각 및 증거 등)"
                    placeholderTextColor="#9AA7B8"
                    multiline
                  />
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate("CaregiverMain")}>
            <Text>🏠</Text>
            <Text style={styles.bottomLabel}>홈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>📷</Text>
            <Text style={[styles.bottomLabel, { color: "#0B4EA2" }]}>QR 체크</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}>
            <Text>🚨</Text>
            <Text style={[styles.bottomLabel, { color: "#CC5A66" }]}>긴급 호출</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
