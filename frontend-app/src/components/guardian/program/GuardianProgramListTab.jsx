import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { styles } from "@/styles/guardianProgram.styles";
import {
  PROGRAM_FILTERS,
  PROGRAM_FILTER_LABEL_KEYS,
  PROGRAM_STATUS_LABEL_KEYS,
  formatDateTime,
  formatPeriod,
  getApplyButtonText,
  getStatusBadgeStyle,
  getStatusBadgeTextStyle,
} from "../../../utils/guardianProgramUtils";

export default function GuardianProgramListTab({
  programs,
  programFilter,
  onProgramFilterChange,
  isNonGuardianToken,
  applyingId,
  applications,
  onPressApply,
}) {
  const { t } = useI18n();

  const filteredPrograms =
    programFilter === "전체"
      ? programs
      : programs.filter((program) => program.recruitStatus === programFilter);

  const isAlreadyApplied = (postId) =>
    applications.some((a) => {
      const ap = a.postId != null ? Number(a.postId) : NaN;
      const pp = postId != null ? Number(postId) : NaN;
      return (
        !Number.isNaN(ap) &&
        !Number.isNaN(pp) &&
        ap === pp &&
        (a.status === "PENDING_APPROVAL" || a.status === "APPROVED")
      );
    });

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {PROGRAM_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              programFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => onProgramFilterChange(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                programFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {t(PROGRAM_FILTER_LABEL_KEYS[filter])}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredPrograms.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {programFilter === "전체"
              ? t("program.empty_all")
              : t("program.empty_all")}
          </Text>
        </View>
      ) : (
        filteredPrograms.map((program) => {
          const pid = program.id ?? program.postId;
          const pidNum = Number(pid);
          const alreadyApplied = isAlreadyApplied(pid);
          const capacity = program.capacity ?? 0;
          const currentEnrolled = program.currentEnrolled ?? 0;
          const isFull = capacity > 0 && currentEnrolled >= capacity;
          const canApply =
            program.recruitStatus === "모집 중" ||
            program.recruitStatus === "모집 예정";

          const disabled =
            isNonGuardianToken ||
            !canApply ||
            alreadyApplied ||
            isFull ||
            applyingId === pidNum;

          const statusLabelKey = PROGRAM_STATUS_LABEL_KEYS[program.recruitStatus];

          return (
            <View key={pid} style={styles.programCard}>
              <View style={styles.cardTopRow}>
                <View style={getStatusBadgeStyle(program.recruitStatus)}>
                  <Text style={getStatusBadgeTextStyle(program.recruitStatus)}>
                    {statusLabelKey ? t(statusLabelKey) : t("program.no_program_info")}
                  </Text>
                </View>

                <Text style={styles.programDate}>
                  {formatDateTime(program.startAt, t)}
                </Text>
              </View>

              <Text style={styles.programTitle}>{program.title}</Text>

              {!!program.content && (
                <Text style={styles.programContent} numberOfLines={2}>
                  {program.content}
                </Text>
              )}

              <View style={styles.detailBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("program.detail_schedule")}</Text>
                  <Text style={styles.detailValue}>
                    {formatPeriod(program.startAt, program.endAt, t)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("program.detail_condition")}</Text>
                  <Text style={styles.detailValue}>{t("program.condition_text")}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  {t("program.enrolled_count_prefix")}
                  {currentEnrolled}
                  {t("program.enrolled_count_suffix")}
                  {capacity ? `${t("program.capacity_prefix")}${capacity}${t("program.capacity_suffix")}` : ""}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.applyButton, disabled && styles.applyButtonDisabled]}
                disabled={disabled}
                onPress={() => onPressApply(program)}
              >
                <Text
                  style={[
                    styles.applyButtonText,
                    disabled && styles.applyButtonTextDisabled,
                  ]}
                >
                  {t(getApplyButtonText({
                    alreadyApplied,
                    isFull,
                    recruitStatus: program.recruitStatus,
                    applying: applyingId === pidNum,
                    canApply,
                  }))}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </>
  );
}
