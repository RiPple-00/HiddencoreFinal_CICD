package hiddencore.ddasum.backend.web.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JSON 역직렬화를 위해 setter 필요 (@Getter만 있으면 Jackson이 필드를 채우지 못할 수 있음)
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ScheduleCreateRequest {

    private Long facilityId;
    private Long createdUserId;
    private Long patientId;
    private String title;
    private String content;
    private LocalDateTime scheduledAt;
    private LocalDateTime endAt;
    private String scheduleType;
}
