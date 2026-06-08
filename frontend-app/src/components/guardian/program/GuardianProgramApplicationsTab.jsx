import React from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { styles } from "@/styles/guardianProgram.styles";
import { formatDate, formatDateTime } from "../../../utils/guardianProgramUtils";

export default function GuardianProgramApplicationsTab({
  applications,
  cancelingId,
  onPressCancelApplication,
}) {
  const { t } = useI18n();

  if (applications.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>{t("program.empty_applications")}</Text>
      </View>
    );
  }

  return (
    <>
      {applications.map((application) => (
        <View key={application.documentId} style={styles.historyCard}>
          <Text style={styles.historyTitle}>{application.programTitle}</Text>

          <Text style={styles.historyInfo}>
            {t("program.detail_program_date_label")}: {formatDateTime(application.programStartAt, t)}
          </Text>

          <Text style={styles.historyInfo}>
            {t("program.detail_target_patient")}: {application.patientName || "-"}
          </Text>

          <View style={styles.historyBottomRow}>
            <Text style={styles.historyStatus}>
              {t("program.detail_status_label")}: {application.statusLabel || application.status || "-"}
            </Text>

            <Text style={styles.historyDate}>
              {t("program.detail_applied_date")} {formatDate(application.requestedAt, t)}
            </Text>
          </View>

          {application.status === "PENDING_APPROVAL" && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                cancelingId === application.documentId && styles.cancelButtonDisabled,
              ]}
              disabled={cancelingId === application.documentId}
              onPress={() => onPressCancelApplication(application)}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  cancelingId === application.documentId && styles.cancelButtonTextDisabled,
                ]}
              >
                {cancelingId === application.documentId
                  ? t("program.cancel_applying")
                  : t("program.cancel_button")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </>
  );
}
