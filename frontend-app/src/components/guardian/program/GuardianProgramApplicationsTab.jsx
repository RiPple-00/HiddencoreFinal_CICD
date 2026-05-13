// 컴포넌트 설명: 보호자 프로그램 신청 내역 탭

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";
import { formatDate, formatDateTime } from "../../../utils/guardianProgramUtils";

export default function GuardianProgramApplicationsTab({
  applications,
  cancelingId,
  onPressCancelApplication,
}) {
  if (applications.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>신청한 프로그램이 없습니다.</Text>
      </View>
    );
  }

  return (
    <>
      {applications.map((application) => (
        <View key={application.documentId} style={styles.historyCard}>
          <Text style={styles.historyTitle}>{application.programTitle}</Text>

          <Text style={styles.historyInfo}>
            프로그램 날짜: {formatDateTime(application.programStartAt)}
          </Text>

          <Text style={styles.historyInfo}>
            대상 환자: {application.patientName || "-"}
          </Text>

          <View style={styles.historyBottomRow}>
            <Text style={styles.historyStatus}>
              상태: {application.statusLabel || application.status || "-"}
            </Text>

            <Text style={styles.historyDate}>
              신청일 {formatDate(application.requestedAt)}
            </Text>
          </View>

          {application.status === "PENDING_APPROVAL" && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                cancelingId === application.documentId &&
                  styles.cancelButtonDisabled,
              ]}
              disabled={cancelingId === application.documentId}
              onPress={() => onPressCancelApplication(application)}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  cancelingId === application.documentId &&
                    styles.cancelButtonTextDisabled,
                ]}
              >
                {cancelingId === application.documentId
                  ? "취소 중..."
                  : "신청 취소"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </>
  );
}
