import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { styles } from "@/styles/guardianProgram.styles";

export default function GuardianProgramCancelModal({
  visible,
  selectedApplication,
  cancelingId,
  onRequestClose,
  onConfirm,
  onCancel,
}) {
  const { t } = useI18n();
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

          <Text style={styles.modalTitle}>{t("program.modal_cancel_title")}</Text>

          <Text style={styles.modalProgramTitle}>
            {selectedApplication?.programTitle}
          </Text>

          <Text style={styles.modalDescription}>
            {t("program.modal_cancel_question")}
          </Text>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
              disabled={!!cancelingId}
            >
              <Text style={styles.modalCancelText}>{t("program.modal_no")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalDangerButton]}
              onPress={onConfirm}
              disabled={!!cancelingId}
            >
              <Text style={styles.modalDangerText}>
                {cancelingId ? t("program.cancel_applying") : t("program.modal_yes")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
