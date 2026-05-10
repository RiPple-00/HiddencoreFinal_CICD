package hiddencore.ddasum.backend.web.dto.care;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareChecklistLatestResponse {

    private Long noteId;
    private Long patientId;
    private String patientName;
    private LocalDateTime updatedAt;
    private Long recordedByUserId;
    private String recordedByName;
    private JsonNode checklist;
}
