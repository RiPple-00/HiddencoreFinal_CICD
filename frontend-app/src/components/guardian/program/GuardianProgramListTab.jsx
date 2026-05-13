// 컴포넌트 설명: 보호자 프로그램 목록 및 필터링 탭

import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/guardianProgram.styles";
import {
  PROGRAM_FILTERS,
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
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredPrograms.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {programFilter === "전체"
              ? "등록된 프로그램이 없습니다."
              : `${programFilter} 프로그램이 없습니다.`}
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

          return (
            <View key={pid} style={styles.programCard}>
              <View style={styles.cardTopRow}>
                <View style={getStatusBadgeStyle(program.recruitStatus)}>
                  <Text style={getStatusBadgeTextStyle(program.recruitStatus)}>
                    {program.recruitStatus || "모집 정보 없음"}
                  </Text>
                </View>

                <Text style={styles.programDate}>
                  {formatDateTime(program.startAt)}
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
                  <Text style={styles.detailLabel}>프로그램 일시</Text>
                  <Text style={styles.detailValue}>
                    {formatPeriod(program.startAt, program.endAt)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>신청 조건</Text>
                  <Text style={styles.detailValue}>
                    모집 예정·모집 중인 프로그램만 신청 가능
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  신청 {currentEnrolled}명
                  {capacity ? ` / 정원 ${capacity}명` : ""}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  disabled && styles.applyButtonDisabled,
                ]}
                disabled={disabled}
                onPress={() => onPressApply(program)}
              >
                <Text
                  style={[
                    styles.applyButtonText,
                    disabled && styles.applyButtonTextDisabled,
                  ]}
                >
                  {getApplyButtonText({
                    alreadyApplied,
                    isFull,
                    recruitStatus: program.recruitStatus,
                    applying: applyingId === pidNum,
                    canApply,
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </>
  );
}
