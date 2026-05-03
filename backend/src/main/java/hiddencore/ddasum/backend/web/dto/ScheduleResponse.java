package hiddencore.ddasum.backend.web.dto;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private Long scheduleId;
    private Long facilityId;
    private Long createdUserId;
    private Long patientId;
    private String title;
    private String content;
    private ScheduleType type;
    private LocalDateTime scheduledAt;
    private LocalDateTime endAt;

    public static ScheduleResponse fromEntity(Schedule schedule) {
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
