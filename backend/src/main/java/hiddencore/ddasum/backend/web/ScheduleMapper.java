package hiddencore.ddasum.backend.web;

import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.web.dto.ScheduleResponse;

public class ScheduleMapper {
    public static ScheduleResponse toResponse(Schedule schedule) {
        return ScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .facilityId(schedule.getFacilityId().getFacilityId())
                .createdUserId(schedule.getCreatedUserId().getUserId())
                .patientId(schedule.getPatientId() != null ? schedule.getPatientId().getPatientId() : null)
                .title(schedule.getTitle())
                .content(schedule.getContent())
                .type(schedule.getType())
                .scheduledAt(schedule.getScheduledAt())
                .endAt(schedule.getEndAt())
                .build();
    }
}
