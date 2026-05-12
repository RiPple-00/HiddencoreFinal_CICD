import React, { useState } from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";
import api, { saveAccessToken } from "../../api";
import Text from "@/components/Text";

export default function GuardianLoginPage({ navigation }) {
  const [mode, setMode] = useState("guardian");
  const [loginId, setLoginId] = useState("guardian001");
  const [password, setPassword] = useState("1234");
  /** 직원(요양사 등) 데모 비밀번호는 백엔드 DataSeeder와 동일: office123! */
  const [employeePassword, setEmployeePassword] = useState("office123!");
  const [facilityCode, setFacilityCode] = useState("12345678");
  const [employeeLoginId, setEmployeeLoginId] = useState("3120010101");
  const [loading, setLoading] = useState(false);

  const isGuardian = mode === "guardian";

  const colors = isGuardian
    ? {
        bg: "bg-guardian-bg-secondary",
        inputBorder: "border-guardian-button-secondary",
        inputText: "text-guardian-text-primary",
        btnActive: "bg-guardian-button-primary",
        btnText: "text-guardian-text-primary",
        tabActive: "bg-guardian-button-secondary border-guardian-button-primary",
        tabActiveText: "text-guardian-text-primary",
        title: "text-guardian-text-primary",
      }
    : {
        bg: "bg-caregiver-bg-secondary",
        inputBorder: "border-caregiver-button-secondary",
        inputText: "text-caregiver-text-primary",
        btnActive: "bg-caregiver-button-primary",
        btnText: "text-white",
        tabActive: "bg-caregiver-bg-secondary border-caregiver-button-primary",
        tabActiveText: "text-caregiver-text-primary",
        title: "text-caregiver-text-primary",
      };

  const onSubmit = async () => {
    try {
      setLoading(true);
      if (isGuardian) {
        if (!loginId || !password) {
          Alert.alert("안내", "아이디와 비밀번호를 입력해 주세요.");
          return;
        }
        const response = await api.post("/api/auth/guardian/login", {
          loginId,
          password,
        });

        await saveAccessToken(response.data.accessToken);

        navigation.replace("GuardianMain");
      } else {
        if (!facilityCode || !employeeLoginId || !employeePassword) {
          Alert.alert("안내", "시설코드, 직원 ID, 비밀번호를 모두 입력해 주세요.");
          return;
        }
        const employeeRes = await api.post("/api/auth/employee/login", {
          facilityCode: facilityCode.trim(),
          employeeLoginId: employeeLoginId.trim(),
          password: employeePassword,
        });
        await saveAccessToken(employeeRes.data.accessToken);
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
    <View className={`flex-1 justify-center p-6 ${colors.bg}`}>
      <Text className={`text-2xl font-bold text-center mb-[18px] ${colors.title}`}>따숨 로그인</Text>

      <View className="flex-row gap-2 mb-3">
        {[
          { key: "guardian", label: "보호자" },
          { key: "caregiver", label: "요양사" },
        ].map(({ key, label }) => {
          const isActive = mode === key;
          const activeClass =
            key === "guardian"
              ? "bg-guardian-button-secondary border-guardian-button-primary"
              : "bg-caregiver-bg-secondary border-caregiver-button-primary";
          const activeTextClass =
            key === "guardian" ? "text-guardian-text-primary" : "text-caregiver-text-primary";
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setMode(key)}
              className={`flex-1 border rounded-lg py-[10px] bg-background-neutral ${
                isActive ? activeClass : "border-guardian-button-secondary"
              }`}
            >
              <Text
                className={`text-center font-bold ${
                  isActive ? activeTextClass : "text-guardian-text-neutral opacity-50"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isGuardian ? (
        <>
          <TextInput
            className={`border rounded-lg px-3 py-[10px] mb-[10px] ${colors.inputBorder} ${colors.inputText}`}
            placeholder="아이디"
            placeholderTextColor="#949BA0"
            autoCapitalize="none"
            value={loginId}
            onChangeText={setLoginId}
          />
          <TextInput
            className={`border rounded-lg px-3 py-[10px] mb-[10px] ${colors.inputBorder} ${colors.inputText}`}
            placeholder="비밀번호"
            placeholderTextColor="#949BA0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </>
      ) : (
        <>
          <TextInput
            className={`border rounded-lg px-3 py-[10px] mb-[10px] ${colors.inputBorder} ${colors.inputText}`}
            placeholder="시설코드 (8자리)"
            placeholderTextColor="#949BA0"
            autoCapitalize="none"
            value={facilityCode}
            onChangeText={setFacilityCode}
            maxLength={8}
          />
          <TextInput
            className={`border rounded-lg px-3 py-[10px] mb-[10px] ${colors.inputBorder} ${colors.inputText}`}
            placeholder="직원 ID (10자리)"
            placeholderTextColor="#949BA0"
            autoCapitalize="none"
            value={employeeLoginId}
            onChangeText={setEmployeeLoginId}
            maxLength={10}
          />
          <TextInput
            className={`border rounded-lg px-3 py-[10px] mb-[10px] ${colors.inputBorder} ${colors.inputText}`}
            placeholder="비밀번호 (데모 직원: office123!)"
            placeholderTextColor="#949BA0"
            secureTextEntry
            value={employeePassword}
            onChangeText={setEmployeePassword}
          />
        </>
      )}

      <TouchableOpacity
        className={`rounded-lg py-3 mt-[6px] items-center ${colors.btnActive} ${loading ? "opacity-50" : ""}`}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text className={`font-bold ${colors.btnText}`}>{loading ? "로그인 중..." : "로그인"}</Text>
      </TouchableOpacity>
    </View>
  );
}
