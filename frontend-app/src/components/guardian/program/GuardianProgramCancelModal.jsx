// 컴포넌트 설명: 보호자 프로그램 신청 취소 확인 모달

import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramCancelModal({
  visible,
  selectedApplication,
  cancelingId,
  onRequestClose,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <View style={styles.modalIconCircle}>
            <Text style={styles.modalIcon}>⚠️</Text>
          </View>

          <Text style={styles.modalTitle}>신청 취소</Text>

          <Text style={styles.modalProgramTitle}>
            {selectedApplication?.programTitle}
          </Text>

          <Text style={styles.modalDescription}>
            해당 프로그램 신청을 취소하시겠습니까?
          </Text>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
              disabled={!!cancelingId}
            >
              <Text style={styles.modalCancelText}>아니오</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalDangerButton]}
              onPress={onConfirm}
              disabled={!!cancelingId}
            >
              <Text style={styles.modalDangerText}>
                {cancelingId ? "취소 중..." : "예"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
