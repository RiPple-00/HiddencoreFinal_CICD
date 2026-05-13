// 컴포넌트 설명: 보호자 프로그램 신청 모달

import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";
import { formatPeriod } from "../../../utils/guardianProgramUtils";

export default function GuardianProgramApplyModal({
  visible,
  selectedProgram,
  applyingId,
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
            <Text style={styles.modalIcon}>📝</Text>
          </View>

          <Text style={styles.modalTitle}>프로그램 신청</Text>

          <Text style={styles.modalProgramTitle}>{selectedProgram?.title}</Text>

          <Text style={styles.modalDescription}>
            {formatPeriod(selectedProgram?.startAt, selectedProgram?.endAt)}{" "}
            프로그램을 신청하시겠습니까?
          </Text>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
              disabled={!!applyingId}
            >
              <Text style={styles.modalCancelText}>아니오</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={onConfirm}
              disabled={!!applyingId}
            >
              <Text style={styles.modalConfirmText}>
                {applyingId ? "신청 중..." : "예"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
