/** 신청 관리 API 응답 정규화 (camelCase / snake_case 호환) */
export const normalizeManagementResponse = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      programInfo: null,
      confirmedApplicants: [],
      waitingApplicants: [],
      rejectedApplicants: [],
    };
  }

  const programInfo = raw.programInfo ?? raw.program_info ?? null;
  const normalizeApplicant = (a) => ({
    applicationId: a.applicationId ?? a.application_id,
    patientId: a.patientId ?? a.patient_id,
    patientName: a.patientName ?? a.patient_name,
    genderAge: a.genderAge ?? a.gender_age,
    guardianPhone: a.guardianPhone ?? a.guardian_phone,
    status: a.status,
    statusLabel: a.statusLabel ?? a.status_label,
    appliedAt: a.appliedAt ?? a.applied_at,
  });

  const list = (key, snakeKey) => {
    const arr = raw[key] ?? raw[snakeKey];
    return Array.isArray(arr) ? arr.map(normalizeApplicant) : [];
  };

  return {
    programInfo: programInfo
      ? {
          ...programInfo,
          postId: programInfo.postId ?? programInfo.post_id,
          facilityId: programInfo.facilityId ?? programInfo.facility_id,
          totalQuota: programInfo.totalQuota ?? programInfo.total_quota,
          currentEnrolled: programInfo.currentEnrolled ?? programInfo.current_enrolled,
          confirmedCount: programInfo.confirmedCount ?? programInfo.confirmed_count,
          waitingCount: programInfo.waitingCount ?? programInfo.waiting_count,
          remainingDays: programInfo.remainingDays ?? programInfo.remaining_days,
          recruitStatus: programInfo.recruitStatus ?? programInfo.recruit_status,
        }
      : null,
    confirmedApplicants: list('confirmedApplicants', 'confirmed_applicants'),
    waitingApplicants: list('waitingApplicants', 'waiting_applicants'),
    rejectedApplicants: list('rejectedApplicants', 'rejected_applicants'),
  };
};
