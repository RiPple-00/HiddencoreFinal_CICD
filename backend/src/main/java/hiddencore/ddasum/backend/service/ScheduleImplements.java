package hiddencore.ddasum.backend.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import hiddencore.ddasum.backend.repository.ScheduleRepository;
import hiddencore.ddasum.backend.web.dto.ScheduleResponse;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleImplements {
    private final ScheduleRepository scheduleRepository;

    // 해당 월 시작일 계산
    private LocalDateTime getStartOfMonth(LocalDateTime date) {
        return date.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
    }

    // 해당 월 종료일 계산
    private LocalDateTime getEndOfMonth(LocalDateTime date) {
        return date.withDayOfMonth(date.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59).withNano(999999999);
    }

    // filter가 facility이면 전체 조회
    private List<ScheduleResponse> getFacilitySchedules(Long facilityId, LocalDateTime date) {
        LocalDateTime start = getStartOfMonth(date);
        LocalDateTime end = getEndOfMonth(date);
        List<Schedule> schedules = scheduleRepository.findByFacilityId_FacilityIdAndScheduledAtBetween(facilityId, start, end);
        return convertToResponse(schedules);
    }

    // filter가 personal이면 개인 일정 조회
    private List<ScheduleResponse> getPersonalSchedules(Long facilityId, LocalDateTime date) {
        LocalDateTime start = getStartOfMonth(date);
        LocalDateTime end = getEndOfMonth(date);
        List<Schedule> schedules = scheduleRepository.findByFacilityId_FacilityIdAndTypeAndScheduledAtBetween(facilityId, ScheduleType.PERSONAL, start, end);
        return convertToResponse(schedules);
    }

    // filter가 program이면 프로그램 일정 조회
    private List<ScheduleResponse> getProgramSchedules(Long facilityId, LocalDateTime date) {
        LocalDateTime start = getStartOfMonth(date);
        LocalDateTime end = getEndOfMonth(date);
        List<Schedule> schedules = scheduleRepository.findByFacilityId_FacilityIdAndTypeAndScheduledAtBetween(facilityId, ScheduleType.PROGRAM, start, end);
        return convertToResponse(schedules);
    }

    // 조회 결과를 dto로 변환하여 반환
    private List<ScheduleResponse> convertToResponse(List<Schedule> schedules) {
        return schedules.stream()
                .map(schedule -> ScheduleResponse.builder()
                        .scheduleId(schedule.getScheduleId())
                        .facilityId(schedule.getFacilityId().getFacilityId())
                        .createdUserId(schedule.getCreatedUserId().getUserId())
                        .patientId(schedule.getPatientId() != null ? schedule.getPatientId().getPatientId() : null)
                        .title(schedule.getTitle())
                        .content(schedule.getContent())
                        .type(schedule.getType())
                        .scheduledAt(schedule.getScheduledAt())
                        .endAt(schedule.getEndAt())
                        .build())
                .collect(Collectors.toList());
    }

}