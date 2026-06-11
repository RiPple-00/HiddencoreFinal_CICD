import React from "react";
import { View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { styles } from "@/styles/guardianProgram.styles";
import { formatDate } from "@/utils/guardianProgramUtils";

function formatVisitDateTime(visitDate, visitTime, t) {
  const datePart = formatDate(visitDate, t);
  if (!visitTime) {
    return datePart;
  }
  const time = String(visitTime).slice(0, 5);
  return `${datePart} ${time}`;
}

export default function GuardianVisitApplicationsTab({ applications }) {
  const { t } = useI18n();

  if (!applications.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>{t("visit.empty_applications")}</Text>
      </View>
    );
  }

  return (
    <>
      {applications.map((application) => (
        <View key={application.visitRequestId} style={styles.historyCard}>
          <Text style={styles.historyTitle}>
            {application.visitType || t("visit.default_type")}
          </Text>

          <Text style={styles.historyInfo}>
            {t("visit.detail_datetime")}:{" "}
            {formatVisitDateTime(application.visitDate, application.visitTime, t)}
          </Text>

          <Text style={styles.historyInfo}>
            {t("visit.detail_patient")}: {application.patientName || "-"}
            {application.patientRoom ? ` (${application.patientRoom})` : ""}
          </Text>

          {application.visitorName ? (
            <Text style={styles.historyInfo}>
              {t("visit.detail_visitor")}: {application.visitorName}
            </Text>
          ) : null}

          <View style={styles.historyBottomRow}>
            <Text style={styles.historyStatus}>
              {t("visit.detail_status")}:{" "}
              {application.status
                ? t(
                    `visit.status.${application.status}`,
                    application.statusLabel || application.status,
                  )
                : "-"}
            </Text>

            <Text style={styles.historyDate}>
              {t("visit.detail_applied_date")}{" "}
              {formatDate(application.requestedAt, t)}
            </Text>
          </View>

          {application.status === "REJECTED" && application.rejectReason ? (
            <Text style={[styles.historyInfo, { marginTop: 8 }]}>
              {t("visit.reject_reason")}: {application.rejectReason}
            </Text>
          ) : null}
        </View>
      ))}
    </>
  );
}
