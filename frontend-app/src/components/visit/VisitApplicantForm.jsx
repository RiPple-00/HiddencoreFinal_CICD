// 신청자 성함
// 연락처
// 환자와의 관계

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Text from "../Text";

const VisitApplicantForm = ({ onSubmit }) => {
  const [applicantName,  setApplicantName]  = useState("");
  const [contactNumber,  setContactNumber]  = useState("");
  const [relationship,   setRelationship]   = useState("");

  const handleSubmit = () => {
    onSubmit({ applicantName, contactNumber, relationship });
  };

  const fields = [
    {
      label:       "신청자 성함",
      value:       applicantName,
      onChange:    setApplicantName,
      placeholder: "성함을 입력하세요",
      keyboardType: "default",
    },
    {
      label:       "연락처",
      value:       contactNumber,
      onChange:    setContactNumber,
      placeholder: "010-0000-0000",
      keyboardType: "phone-pad",
    },
    {
      label:       "환자와의 관계",
      value:       relationship,
      onChange:    setRelationship,
      placeholder: "예) 자녀, 배우자",
      keyboardType: "default",
    },
  ];

  const canSubmit =
    applicantName.trim().length > 0 &&
    contactNumber.trim().length > 0 &&
    relationship.trim().length > 0;

  return (
    <View className="px-4 py-5">
      <Text className="text-lg font-extrabold text-guardian-text-primary mb-5">
        신청자 정보
      </Text>

      <View className="gap-4">
        {fields.map(({ label, value, onChange, placeholder, keyboardType }) => (
          <View key={label}>
            <Text className="text-sm font-bold text-guardian-text-primary mb-2">
              {label}
            </Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor="#949BA0"
              keyboardType={keyboardType}
              className="bg-guardian-bg-secondary rounded-xl px-[14px] py-[14px] text-base text-guardian-text-primary"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        className={`mt-6 bg-guardian-button-primary py-4 rounded-xl items-center ${!canSubmit ? "opacity-50" : ""}`}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text className="text-guardian-text-primary text-base font-extrabold">
          다음
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VisitApplicantForm;