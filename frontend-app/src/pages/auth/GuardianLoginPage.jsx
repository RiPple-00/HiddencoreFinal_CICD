import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../../api";

export default function GuardianLoginPage({ navigation }) {
  const [mode, setMode] = useState("guardian");
  const [loginId, setLoginId] = useState("guardian001");
  const [password, setPassword] = useState("1234");
  /** 직원(요양사 등) 데모 비밀번호는 백엔드 DataSeeder와 동일: office123! */
  const [employeePassword, setEmployeePassword] = useState("office123!");
  const [facilityCode, setFacilityCode] = useState("12345678");
  const [employeeLoginId, setEmployeeLoginId] = useState("3120010101");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      if (mode === "guardian") {
        if (!loginId || !password) {
          Alert.alert("안내", "아이디와 비밀번호를 입력해 주세요.");
          return;
        }
        await api.post("/api/auth/guardian/login", { loginId, password });
        navigation.replace("GuardianMain");
      } else {
        if (!facilityCode || !employeeLoginId || !employeePassword) {
          Alert.alert("안내", "시설코드, 직원 ID, 비밀번호를 모두 입력해 주세요.");
          return;
        }
        await api.post("/api/auth/employee/login", {
          facilityCode: facilityCode.trim(),
          employeeLoginId: employeeLoginId.trim(),
          password: employeePassword,
        });
        navigation.replace("CaregiverMain");
      }
    } catch (e) {
      const message = e?.response?.data?.message || "로그인에 실패했습니다.";
      Alert.alert("로그인 실패", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>따숨 로그인</Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeButton, mode === "guardian" && styles.modeButtonActive]}
          onPress={() => setMode("guardian")}
        >
          <Text style={[styles.modeButtonText, mode === "guardian" && styles.modeButtonTextActive]}>
            보호자
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === "caregiver" && styles.modeButtonActive]}
          onPress={() => setMode("caregiver")}
        >
          <Text style={[styles.modeButtonText, mode === "caregiver" && styles.modeButtonTextActive]}>
            요양사
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "guardian" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="아이디"
            autoCapitalize="none"
            value={loginId}
            onChangeText={setLoginId}
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="시설코드 (8자리)"
            autoCapitalize="none"
            value={facilityCode}
            onChangeText={setFacilityCode}
            maxLength={8}
          />
          <TextInput
            style={styles.input}
            placeholder="직원 ID (10자리)"
            autoCapitalize="none"
            value={employeeLoginId}
            onChangeText={setEmployeeLoginId}
            maxLength={10}
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호 (데모 직원: office123!)"
            secureTextEntry
            value={employeePassword}
            onChangeText={setEmployeePassword}
          />
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "로그인 중..." : "로그인"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  modeButtonActive: {
    borderColor: "#0ea5e9",
    backgroundColor: "#ecfeff",
  },
  modeButtonText: {
    textAlign: "center",
    color: "#6b7280",
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: "#0369a1",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
