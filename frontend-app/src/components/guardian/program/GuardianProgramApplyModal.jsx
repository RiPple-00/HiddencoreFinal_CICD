import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
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
            <Text style={styles.modalIcon}>📝</Text>
          </View>

          <Text style={styles.modalTitle}>{t("program.modal_apply_title")}</Text>

          <Text style={styles.modalProgramTitle}>{selectedProgram?.title}</Text>

          <Text style={styles.modalDescription}>
            {formatPeriod(selectedProgram?.startAt, selectedProgram?.endAt, t)}{" "}
            {t("program.modal_apply_question")}
          </Text>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
              disabled={!!applyingId}
            >
              <Text style={styles.modalCancelText}>{t("program.modal_no")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={onConfirm}
              disabled={!!applyingId}
            >
              <Text style={styles.modalConfirmText}>
                {applyingId ? t("program.applying") : t("program.modal_yes")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
