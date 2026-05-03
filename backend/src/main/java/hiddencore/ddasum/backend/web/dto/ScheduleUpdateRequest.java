package hiddencore.ddasum.backend.web.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ScheduleUpdateRequest {

    private Long facilityId;
    private Long createdUserId;
    private Long patientId;
    private String title;
    private String content;
    private LocalDateTime scheduledAt;
    private LocalDateTime endAt;
}
